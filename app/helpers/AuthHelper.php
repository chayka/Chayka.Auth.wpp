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

    /**
     * Each item can hold:
     * - false: screen was not rendered as embedded
     * - url to page with embedded form
     * @var array
     */
    protected static $screens;

    protected static $navRendered = false;

    /**
     * Get screen options loaded from db
     *
     * @return array
     */
    protected static function getScreens(){
        if(!self::$screens){
            self::$screens = array(
                'join' => OptionHelper::getOption('urlJoin'),
                'login' => OptionHelper::getOption('urlLogin'),
                'logout' => false,
                'password-change' => false,
                'password-reset' => false,
                'password-forgot' => OptionHelper::getOption('urlForgotPassword'),
            );
        }

        return self::$screens;
    }

    public static function renderEmbeddedForm($screen){
        NlsHelper::load('authForm');
        $view = Plugin::getView();
        $view->assign('screen', $screen);
        $view->assign('screens', self::getScreens());
        $view->assign('urlLoggedIn', OptionHelper::getOption('urlLoggedIn', ''));
        $view->assign('urlLoggedOut', OptionHelper::getOption('urlLoggedOut', ''));
        self::$navRendered = true;
        echo $view->render('form/form-embedded.phtml');
    }

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
            $view->assign('screens', self::getScreens());
            $view->assign('authMode', OptionHelper::getOption('authMode', 'reload'));
            $view->assign('urlLoggedIn', OptionHelper::getOption('urlLoggedIn', ''));
            $view->assign('urlLoggedOut', OptionHelper::getOption('urlLoggedOut', ''));
            $view->assign('navRendered', self::$navRendered);
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

    /**
     * Register new user
     *
     * @param $email
     * @param string $login
     * @param string $password
     * @return UserModel|WP_Error
     */
    public static function registerUser($email, $login = '', $password = ''){
        NlsHelper::load('auth');
        if(!$login){
            $login = $email;
        }
        if($login == $email){
            $login = str_replace('@', '.', $login);
        }
        if(!$password){
            $password = wp_generate_password(12, false);
        }

        $errors = new WP_Error();

        $sanitized_user_login = sanitize_user($login);
        $email = apply_filters('user_registration_email', $email);

        // Check the username
        if ($sanitized_user_login == '') {
            $errors->add('empty_username', NlsHelper::_('error_empty_username'));
        } elseif (!validate_username($login)) {
            $errors->add('invalid_username', NlsHelper::_('error_invalid_username'));
            $sanitized_user_login = '';
        } elseif (username_exists($sanitized_user_login)) {
            $errors->add('username_exists', NlsHelper::_('error_username_exists'));
        }

        // Check the e-mail address
        if ($email == '') {
            $errors->add('empty_email', NlsHelper::_('error_empty_email'));
        } elseif (!is_email($email)) {
            $errors->add('invalid_email', NlsHelper::_('error_invalid_email'));
            $email = '';
        } elseif (email_exists($email)) {
            $errors->add('email_exists', NlsHelper::_('error_email_exists'));
        }

        do_action('register_user', $sanitized_user_login, $email, $errors);

        $errors = apply_filters('registration_errors', $errors, $sanitized_user_login, $email);

        if (!$errors->get_error_code()) {
            $user_pass = $password; //wp_generate_password(12, false);
            $user_id = wp_create_user($sanitized_user_login, $user_pass, $email);
            if ($user_id) {
                update_user_option($user_id, 'default_password_nag', true, true); //Set up the Password change nag.
                update_user_option($user_id, 'show_admin_bar_front', false, true); //

                $user = UserModel::selectById($user_id);
                $user->setRole(OptionHelper::getOption('newUserRole', 'subscriber'));
                $user->update();
                $key = AuthHelper::ensureActivationKey($user);
                EmailHelper::userRegistered($user, $user_pass, $key);
                return $user;
            } else {
                $errors->add('register_fail', NlsHelper::_('error_register_fail', get_option('admin_email')));
            }
        }
        $errors = self::translateErrors($errors);
        return $errors;
    }

    /**
     * Customize a little standard errors
     *
     * @param WP_Error $errors
     * @return WP_Error
     */
    public static function translateErrors($errors){
        NlsHelper::load('auth');
        $newErrors = new WP_Error();
        $newMessage = '';
        foreach ($errors->errors as $code => $error) {
            switch ($code) {
                case 'incorrect_password':
                    $newMessage = NlsHelper::_('error_invalid_password');
                    $code = "password";
                    break;
                case 'username_exists':
                    $newMessage = NlsHelper::_('error_username_exists');
                    $code = "name";
                    break;
                case 'email_exists':
                    $newMessage = NlsHelper::_('error_email_exists');
                    $code = "email";
                    break;
                case 'invalid_username':
                    $newMessage = NlsHelper::_('error_invalid_combo');
                    $code = "name";
                    break;
                case 'empty_username':
                case 'empty_password':
                case 'authentication_failed':
                    break;
                default:
            }
            if ($newMessage) {
                $newErrors->add($code, $newMessage);
//                $errors->errors[$code] = array($newMessage);
            }else{
                $newErrors->add($code, $error);
            }
        }

        return $newErrors;

    }

} 