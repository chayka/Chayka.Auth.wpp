<?php

namespace Chayka\Auth;

use Chayka\WP;

class Plugin extends WP\Plugin{

    /* chayka: constants */
    
    public static $instance = null;

    public static function init(){
        if(!static::$instance){
            static::$instance = $app = new self(__FILE__, array(
                'auth'
                /* chayka: init-controllers */
            ));
	        $app->addSupport_UriProcessing();
	        $app->addSupport_ConsolePages();
            /* chayka: init-addSupport */

            AuthHelper::addForm();
        }
    }


    /**
     * Register your action hooks here using $this->addAction();
     */
    public function registerActions() {
        $this->addAction('parse_request', array('Chayka\\Auth\\AuthHelper', 'hideActivationKey'));
    	/* chayka: registerActions */
    }

    /**
     * Register your action hooks here using $this->addFilter();
     */
    public function registerFilters() {
		/* chayka: registerFilters */
    }

    /**
     * Register scripts and styles here using $this->registerScript() and $this->registerStyle()
     *
     * @param bool $minimize
     */
    public function registerResources($minimize = false) {
//        $this->registerBowerResources(true);

        $this->setResSrcDir('src/');
        $this->setResDistDir('dist/');

        $this->registerNgScript('chayka-auth', 'ng-modules/chayka-auth.js', array('jquery', 'angular', 'chayka-translate', 'chayka-forms', 'chayka-buttons', 'chayka-modals', 'chayka-spinners', 'chayka-ajax', 'chayka-utils', 'chayka-avatars'));
        $this->registerStyle('chayka-auth', 'ng-modules/chayka-auth.css', array('chayka-forms', 'chayka-modals'));
        /* chayka: registerResources */
    }

    /**
     * Routes are to be added here via $this->addRoute();
     */
    public function registerRoutes() {
        $this->addRoute('default');
    }

    /**
     * Registering console pages
     */
    public function registerConsolePages(){
        $this->addConsoleSubPage('chayka-core', 'Auth', 'update_core', 'chayka-auth', '/admin/');
        /* chayka: registerConsolePages */
    }

    /**
     * Implement to add addShortcodes() calls;
     */
    public function registerShortcodes(){
        $this->addShortcode('chayka_auth_login');
        $this->addShortcode('chayka_auth_join');
        $this->addShortcode('chayka_auth_forgot_password');
        $this->addShortcode('chayka_auth_menu');

    	/* chayka: registerShortcodes */
    }
}