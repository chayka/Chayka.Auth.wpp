<?php
/**
 * Created by PhpStorm.
 * User: borismossounov
 * Date: 27.10.14
 * Time: 11:22
 */

namespace Chayka\Auth;

use Chayka\Helpers\InputHelper;
use Chayka\MVC\Controller;
use Chayka\WP\Helpers\JsonHelper;
use Chayka\WP\Helpers\NlsHelper;
use Chayka\WP\Models\UserModel;
use WP_Error;

class AuthController extends Controller{
    public function init() {
//        Util::turnRendererOff();
//        NlsHelper::setNlsDir(WPP_BRX_AUTH_PATH . 'nls');
//        NlsHelper::load('controllers/auth');
    }

    public function checkEmailAction() {
        $email = InputHelper::getParam("email");
        $payload = array('email' => $email);

        if (email_exists($email)) {
            JsonHelper::respondErrors(new WP_Error('email_exists', NlsHelper::_('error_email_exists')), 200);
        } else {
            JsonHelper::respond($payload);
        }
    }

    public function checkNameAction() {
        $login = InputHelper::getParam("login");

        $payload = array('login' => $login);
        if (username_exists($login)) {
            JsonHelper::respondErrors('username_exists', NlsHelper::_('error_username_exists'), 200);
        } else {
            JsonHelper::respond($payload);
        }
    }

    public function joinAction() {
        // TODO: Implement BlocadeHelper
//        if (BlockadeHelper::isBlocked()) {
//            JsonHelper::respondError(NlsHelper::_('error_site_blocked'), 'error_site_blocked');
//        }
        $email = InputHelper::getParam("email");
        $login = InputHelper::getParam("login");
        $password = InputHelper::getParam("password", wp_generate_password(12, false));

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
                EmailHelper::userRegistered($user, $user_pass);
                JsonHelper::respond($user);
            } else {
                $errors->add('register_fail', NlsHelper::_('error_register_fail', get_option('admin_email')));
            }
        }

        JsonHelper::respondErrors($errors);
    }

    public function loginAction() {
        $secure_cookie = '';

        $email = InputHelper::getParam('log');
        $pass = InputHelper::getParam('pwd');
        $rememberMe = InputHelper::getParam('remember');

        $login = '';
        $user = null;
        if ($email) {
            $user = UserModel::selectByEmail($email);
            $login = $user ? $user->getLogin() : $email;
        }

        // If the user wants ssl but the session is not ssl, force a secure cookie.
        if (!empty($email) && !force_ssl_admin()) {
            if ($user) {
                if (get_user_option('use_ssl', $user->getId())) {
                    $secure_cookie = true;
                    force_ssl_admin(true);
                }
            }
        }

        $reauth = !!InputHelper::getParam('reauth');
        // Clear any stale cookies.
        if ($reauth) {
            wp_clear_auth_cookie();
        }

        $user = wp_signon(array(
            'user_login' => $login,
            'user_password' => $pass,
            'remember' => $rememberMe), $secure_cookie);

//        if (BlockadeHelper::isBlocked() && (!$user || is_wp_error($user) || !in_array('administrator', $user->roles))) {
//            JsonHelper::respondError(NlsHelper::_('error_site_blocked'), 'error_site_blocked');
//        }

        if (!is_wp_error($user)) {
            JsonHelper::respond($user);
        }

        JsonHelper::respondErrors($user);
    }

    public function logoutAction() {
        wp_logout();
        $user = new UserModel();
        JsonHelper::respond($user);
        exit();
    }

    public function forgotPasswordAction() {

        $errors = new WP_Error();

        $loginOrEmail = InputHelper::getParam('email');
        $user = null;

        if (empty($loginOrEmail)) {
            $errors->add('empty_email_or_username', NlsHelper::_('error_empty_email_or_username'));
        } else if (strpos($loginOrEmail, '@')) {
            $user = UserModel::selectByEmail($loginOrEmail);
        } else {
            $login = trim($loginOrEmail);
            $user = UserModel::selectByLogin($login);
        }
        if (!$user) {
            $errors->add('invalid_combo', NlsHelper::_('error_invalid_combo'));
        }

        if ($errors->get_error_code()) {
            JsonHelper::respondErrors($errors);
        }

        do_action('retrieve_password', $user->getLogin());

        $allow = apply_filters('allow_password_reset', true, $user->getId());

        if (!$allow) {
            $errors->add('no_password_reset', NlsHelper::_('error_no_password_reset'));
        } else if (is_wp_error($allow)) {
            $errors = $allow;
        }
        if ($errors->get_error_code()) {
            JsonHelper::respondErrors($errors);
        }

        $key = AuthHelper::ensureActivationKey($user);

        EmailHelper::forgotPassword($user, $key);

        JsonHelper::respond();
    }

    public function resetPasswordAction() {
        $key = InputHelper::getParam('key');
        $login = InputHelper::getParam('login');

        $user = AuthHelper::checkActivationKey($key, $login);

        if(!$user){
            JsonHelper::respondError('Invalid key', 'invalid_key');
        }

        InputHelper::checkParam('pass1')->required();
        InputHelper::checkParam('pass2')->required();

        InputHelper::validateInput(true);

        $pass1 = InputHelper::getParam('pass1');
        $pass2 = InputHelper::getParam('pass2');

        if ($pass1 != $pass2) {
            $errors = new WP_Error('passwords_mismatch', NlsHelper::_('error_passwords_mismatch'));
            JsonHelper::respondErrors($errors);
        } else {
            AuthHelper::changePassword($user, $pass1);
            EmailHelper::newPassword($user, $pass1);
            JsonHelper::respond($user);
        }

    }

    public function changePasswordAction() {
        $pass = InputHelper::getParam('pass');
        $user = UserModel::currentUser();
        if (!AuthHelper::checkPassword($user, $pass)) {
            $errors = new WP_Error('invalid_password', NlsHelper::_('error_invalid_password'));
            JsonHelper::respondErrors($errors);
        }

        InputHelper::checkParam('pass1')->required();
        InputHelper::checkParam('pass2')->required();

        InputHelper::validateInput(true);

        $pass1 = InputHelper::getParam('pass1');
        $pass2 = InputHelper::getParam('pass2');

        if ($pass1 && $pass2) {
            if ($pass1 != $pass2) {
                $errors = new WP_Error('passwords_mismatch', NlsHelper::_('error_passwords_mismatch'));
                JsonHelper::respondErrors($errors);
            } else {
                AuthHelper::changePassword($user, $pass1);
                EmailHelper::newPassword($user, $pass1);
                JsonHelper::respond($user);
            }
        }
    }


} 