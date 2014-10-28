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

class EmailHelper extends Email\EmailHelper{

    public static function getView(){
        return Plugin::getView();
    }

    /**
     * @param UserModel $user
     * @param string $password
     */
    public static function userRegistered($user, $password){
        self::sendTemplate(sprintf("Учетная запись на %s", $_SERVER['SERVER_NAME']),
            'user-registered.phtml', array('user' => $user, 'password' => $password),
            $user->getEmail());
    }

    /**
     * @param UserModel $user
     * @param $activationKey
     */
    public static function forgotPassword($user, $activationKey){
        self::sendTemplate(sprintf("Смена пароля на %s", $_SERVER['SERVER_NAME']),
            'forgot-password.phtml', array(
                'user' => $user,
                'activationKey' => $activationKey
            ), $user->getEmail());
    }

    /**
     * @param UserModel $user
     * @param $password
     */
    public static function newPassword($user, $password){
        self::sendTemplate(sprintf("Учетная запись на %s", $_SERVER['SERVER_NAME']),
            'new-password.phtml', array('user' => $user, 'password' => $password),
            $user->getEmail());

    }
}