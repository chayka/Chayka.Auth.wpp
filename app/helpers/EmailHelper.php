<?php
/**
 * Created by PhpStorm.
 * User: borismossounov
 * Date: 27.10.14
 * Time: 11:39
 */

namespace Chayka\Auth;

use Chayka\Email;
use Chayka\WP\Models\UserModel;

NlsHelper::load('email');

class EmailHelper extends Email\EmailHelper{

    public static function getView(){
        $view = Plugin::getView();
        return $view;
    }

    /**
     * @param UserModel $user
     * @param string $password
     */
    public static function userRegistered($user, $password){
        self::sendTemplate(NlsHelper::_('email_subject_user_registered', $_SERVER['SERVER_NAME']),
            'email/user-registered.phtml', array('user' => $user, 'password' => $password),
            $user->getEmail());
    }

    /**
     * @param UserModel $user
     * @param $activationKey
     */
    public static function forgotPassword($user, $activationKey){
        self::sendTemplate(NlsHelper::_('email_subject_forgot_password', $_SERVER['SERVER_NAME']),
            'email/forgot-password.phtml', array(
                'user' => $user,
                'activationKey' => $activationKey
            ), $user->getEmail());
    }

    /**
     * @param UserModel $user
     * @param $password
     */
    public static function newPassword($user, $password){
        self::sendTemplate(NlsHelper::_('email_subject_new_password', $_SERVER['SERVER_NAME']),
            'email/new-password.phtml', array('user' => $user, 'password' => $password),
            $user->getEmail());
    }
}