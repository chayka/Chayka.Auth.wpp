<?php

namespace Chayka\Auth;

if(!class_exists('Chayka\WP\SidebarWidget')) return;

use Chayka\WP;

class SidebarWidget extends WP\SidebarWidget {

    public function getView(){
        return Plugin::getView();
    }
}

class AuthUserMenuWidget extends SidebarWidget {
    function __construct() {
        $id = 'auth-usermenu';
        $name = 'Auth User Menu';
        $description = 'Auth User Menu widget by Chayka.Auth plugin';
        parent::__construct($id, $name, $description);
    }
}

add_action( 'widgets_init', array('Chayka\\Auth\\AuthUserMenuWidget', 'registerWidget'));

