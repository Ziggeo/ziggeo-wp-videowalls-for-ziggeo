<?php
/*
Plugin Name: Videowalls for Ziggeo
Plugin URI: https://ziggeo.com/integrations/wordpress
Description: Create beautiful and stylish video walls on your posts and pages utilizing powerful Ziggeo video service in the back
Author: Ziggeo
Version: 1.15
Author URI: https://ziggeo.com
*/

//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();


//While the functions are fast, this will get the string of the path the WP way and keep it saved so we can just reference it. * WP ver 2.8 and up     
define('VIDEOWALLSZ_ROOT_PATH', plugin_dir_path(__FILE__) );

//Setting up the URL so that we can get/built on it later on from the plugin root
define('VIDEOWALLSZ_ROOT_URL', plugins_url('', __FILE__) . '/');

//plugin version - this way other plugins can get it as well and we will be updating this file for each version change as is
define('VIDEOWALLSZ_VERSION', '1.15');

//Include files

if(is_admin()) {
	include_once(VIDEOWALLSZ_ROOT_PATH . 'admin/plugins.php');
	include_once(VIDEOWALLSZ_ROOT_PATH . 'admin/dashboard.php');
	include_once(VIDEOWALLSZ_ROOT_PATH . 'admin/validation.php');
	include_once(VIDEOWALLSZ_ROOT_PATH . 'admin/update.php');
}

include_once(VIDEOWALLSZ_ROOT_PATH . 'core/simplifiers.php');
include_once(VIDEOWALLSZ_ROOT_PATH . 'core/assets.php');

//register
include_once(VIDEOWALLSZ_ROOT_PATH . 'core/run.php');

?>