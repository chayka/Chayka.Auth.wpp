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

require_once 'vendor/autoload.php';

if(!class_exists("Chayka\\WP\\Plugin")){
    add_action( 'admin_notices', function () {
?>
    <div class="error">
        <p>Chayka Framework functionality is not available</p>
    </div>
<?php
	});
}else{
    require_once dirname(__FILE__).'/Plugin.php';
	add_action('init', array("Chayka\\Auth\\Plugin", "init"));
    require_once dirname(__FILE__).'/Sidebar.php';
}