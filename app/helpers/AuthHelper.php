<?php
/**
 * Created by PhpStorm.
 * User: borismossounov
 * Date: 27.10.14
 * Time: 13:12
 */

namespace Chayka\Auth;


use Chayka\Helpers\Util;
use Chayka\Helpers\HttpHeaderHelper;
use Chayka\WP\Helpers\DbHelper;
//use Chayka\WP\Helpers\NlsHelper;
use Chayka\WP\Models\UserModel;
use WP_Error;

class AuthHelper {

    public static function addForm(){
        wp_enqueue_script('chayka-auth');
        wp_enqueue_style('chayka-auth');
        NlsHelper::load('authForm');
        $view = Plugin::getView();
        Plugin::getInstance()->addAction('wp_footer', function() use ($view){
            Util::sessionStart();
            $key = Util::getItem($_SESSION, 'activationkey');
            if($key){
                $view->assign('key', $key);
                $view->assign('screen', 'password-reset');
                unset($_SESSION['activationkey']);
            }
            $view->assign('authMode', OptionsHelper::getOption('authMode', 'reload'));
            echo $view->render('form/form.phtml');
        });
    }

    public static function hideActivationKey(){
        Util::sessionStart();
        if(!empty($_GET['activationkey'])){
            $_SESSION['activationkey'] = $_GET['activationkey'];
//            $_SESSION['activationlogin'] = $_GET['login'];
//            $_SESSION['activationpopup'] = true;
            session_commit();
            HttpHeaderHelper::redirect('/');
        }
    }

    /**
     * Check activation key.
     *
     * @param string $key
     * @return UserModel
     */
    public static function checkActivationKey($key){
        $wpdb = DbHelper::wpdb();

        $key = preg_replace('/[^a-z0-9]/i', '', $key);

        $userId = 0;
        sscanf($key, '%20s%x', $key, $userId);
        $user = get_user_by('id', $userId);//$wpdb->get_row($wpdb->prepare("SELECT * FROM $wpdb->users WHERE ID = %d", $userId));
        if(!$user || md5($key) !== $user->user_activation_key){
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
        // Generate something random for a key...
        $key = wp_generate_password(20, false);
        // Now insert the new md5 key into the db
        DbHelper::update(array('user_activation_key' => md5($key)), $wpdb->users,  array('ID' => $user->getId()));
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
//        unset($_SESSION['activationkey']);
//        unset($_SESSION['activationlogin']);
//        unset($_SESSION['activationpopup']);
        wp_signon(array(
            'user_login' => $user->getLogin(),
            'user_password' => $password
        ));
        session_commit();
    }

} 