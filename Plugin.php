<?php
/**
 * Created by PhpStorm.
 * User: borismossounov
 * Date: 27.10.14
 * Time: 11:09
 */

namespace Chayka\Auth;

use Chayka\WP;

class Plugin extends WP\Plugin{

    public static function init(){
        self::$instance = $plugin = new self(__FILE__, array(
            'auth'
        ));

        $plugin->addSupport_UriProcessing();

        AuthHelper::addForm();
//        $plugin->addAuthForm();
    }


    /**
     * Routes are to be added here via $this->addRoute();
     */
    public function registerRoutes()
    {
        $this->addRoute('default');
    }

    /**
     * Custom post type are to be added here
     */
    public function registerCustomPostTypes()
    {

    }

    /**
     * Custom Taxonomies are to be added here
     */
    public function registerTaxonomies()
    {

    }

    /**
     * Custom Sidebars are to be added here via $this->registerSidbar();
     */
    public function registerSidebars()
    {

    }

    /**
     * Register scripts and styles here using $this->registerScript() and $this->registerStyle()
     *
     * @param bool $minimize
     */
    public function registerResources($minimize = false)
    {
        $this->registerScript('chayka-auth', 'src/ng-modules/chayka-auth.js', array('jquery', 'angular', 'chayka-translate', 'chayka-forms', 'chayka-modals', 'chayka-spinners', 'chayka-ajax', 'chayka-utils'));
        $this->registerStyle('chayka-auth', 'src/ng-modules/chayka-auth.css', array('chayka-forms'));
    }

    /**
     * Register your action hooks here using $this->addAction();
     */
    public function registerActions()
    {
        $this->addAction('parse_request', array('Chayka\\Auth\\AuthHelper', 'hideActivationKey'));
    }

    /**
     * Register your action hooks here using $this->addFilter();
     */
    public function registerFilters()
    {

    }

//    public function addAuthForm(){
//        wp_enqueue_script('chayka-auth');
//        wp_enqueue_style('chayka-auth');
//        NlsHelper::load('authForm');
//        $view = self::getView();
//        $this->addAction('wp_footer', function() use ($view){
//            $view->authMode = OptionsHelper::getOption('authMode', 'reload');
//            echo $view->render('form/form.phtml');
//        });
//    }

}