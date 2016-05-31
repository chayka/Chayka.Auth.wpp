<?php
/**
 * Created by PhpStorm.
 * User: borismossounov
 * Date: 04.11.14
 * Time: 12:53
 */

namespace Chayka\Auth;

use Chayka\WP\MVC\Controller;

class AdminController extends Controller{

    public function init(){
        $this->enqueueNgScriptStyle('chayka-wp-admin');
    }

    public function indexAction(){

    }
} 