<?php
/**
 * Created by PhpStorm.
 * User: borismossounov
 * Date: 04.11.14
 * Time: 16:03
 */

namespace Chayka\Auth;

use Chayka\Helpers\InputHelper;
use Chayka\MVC\Controller;

class ShortcodeController extends Controller {

    public function chaykaAuthLoginAction(){
        AuthHelper::renderEmbeddedForm('login');
    }

    public function chaykaAuthJoinAction(){
        AuthHelper::renderEmbeddedForm('join');
    }

    public function chaykaAuthForgotPasswordAction(){
        AuthHelper::renderEmbeddedForm('password-forgot');
    }

    public function chaykaAuthMenuAction(){
	    $showLabels = InputHelper::getParam('labels', 1);
	    AuthHelper::renderUserMenu($showLabels);
    }
}