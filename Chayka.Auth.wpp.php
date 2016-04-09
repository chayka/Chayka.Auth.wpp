<?php
/**
 * Plugin Name: Chayka.Auth
 * Plugin URI: git@github.com:chayka/Chayka.Auth.wpp.git
 * Description: Chayka framework implementation of Auth process
 * Version: 0.0.1
 * Author: Boris Mossounov <borix@tut.by>
 * Author URI: https://github.com/chayka/
 * License: MIT
 */

require_once __DIR__.'/vendor/autoload.php';
if(!class_exists("Chayka\\WP\\Plugin")){
    add_action( 'admin_notices', function () {
        ?>
        <div class="error">
            <p>Chayka.Core plugin is required in order for Chayka.Auth to work properly</p>
        </div>
        <?php
    });
}else{

    add_action('init', ['Chayka\Auth\Plugin', 'init']);

    class_exists('Chayka\Auth\SidebarWidget');
}