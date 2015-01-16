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
        $this->enqueueScriptStyle('chayka-options-form');
    }

    public function indexAction(){

    }
} 