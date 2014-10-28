<?php
/**
 * Created by PhpStorm.
 * User: borismossounov
 * Date: 27.10.14
 * Time: 13:12
 */

namespace Chayka\Auth;


use Chayka\WP\Helpers\DbHelper;
use Chayka\WP\Helpers\NlsHelper;
use Chayka\WP\Models\UserModel;
use WP_Error;

class AuthHelper {
    /**
     * Check activation key.
     *
     * @param $key
     * @param $login
     * @return UserModel
     */
    public static function checkActivationKey($key, $login){
        $wpdb = DbHelper::wpdb();

        $key = preg_replace('/[^a-z0-9]/i', '', $key);

        if (empty($key) || !is_string($key)) {
            return new WP_Error('invalid_key', NlsHelper::_('Invalid key'));
        }
        if (empty($login) || !is_string($login)) {
            return new WP_Error('invalid_key', NlsHelper::_('Invalid key'));
        }
        $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $wpdb->users WHERE user_activation_key = %s AND user_login = %s", $key, $login));

        if (empty($user)) {
            unset($_SESSION['activationkey']);
            unset($_SESSION['activationlogin']);
            unset($_SESSION['activationpopup']);
            session_commit();
            return null;
        }
        return UserModel::unpackDbRecord($user);
    }

    /**
     * Create user activation key if needed
     *
     * @param UserModel $user
     * @return string
     */
    public static function ensureActivationKey($user){
        $wpdb = DbHelper::wpdb();
        $key = $wpdb->get_var($wpdb->prepare("SELECT user_activation_key FROM $wpdb->users WHERE ID = %d", $user->getId()));
        if (empty($key)) {
            // Generate something random for a key...
            $key = wp_generate_password(20, false);
            do_action('retrieve_password_key', $user->getLogin(), $key);
            // Now insert the new md5 key into the db
            DbHelper::update($wpdb->users, array('user_activation_key' => $key), array('ID' => $user->getId()));
        }

        return $key;
    }

    /**
     * Check if credentials are ok
     *
     * @param UserModel $user
     * @param string $password
     * @return bool
     */
    public static function checkPassword($user, $password) {
        $user = wp_authenticate( $user->getLogin(), $password );
        return !is_wp_error($user);
    }

    /**
     * Change user password and notify him
     *
     * @param UserModel $user
     * @param $password
     */
    public static function changePassword($user, $password) {
        wp_set_password($password, $user->getId());
        unset($_SESSION['activationkey']);
        unset($_SESSION['activationlogin']);
        unset($_SESSION['activationpopup']);
        wp_signon(array(
            'user_login' => $user->getLogin(),
            'user_password' => $password
        ));
        session_commit();
    }

} 