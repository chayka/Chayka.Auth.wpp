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

$requirements = [
    "Chayka\\WP\\Plugin" => 'Chayka.Core plugin is required in order for Chayka.Auth to work properly',
    "Chayka\\Email\\Plugin" => 'Chayka.Email plugin is required in order for Chayka.Auth to work properly',
];

$requirementsMet = true;

foreach($requirements as $cls => $message){
    if(!class_exists($cls)){
        $requirementsMet &= false;
        add_action( 'admin_notices', function () use ($message){
            ?>
            <div class="error">
                <p><?php echo $message; ?></p>
            </div>
            <?php
        });
    }
}

if($requirementsMet){
    require_once dirname(__FILE__).'/Plugin.php';
	add_action('init', array("Chayka\\Auth\\Plugin", "init"));
    require_once dirname(__FILE__).'/Sidebar.php';
}