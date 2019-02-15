<?php

//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();


function videowallsz_p_assets_global() {
	// Ziggeo JS SDK is added through Ziggeo Video plugin. Please download and install it first, then add this one to extend the base Ziggeo plugin with videowalls

	//js
	wp_register_script('videowallsz-plugin-js', VIDEOWALLSZ_ROOT_URL . 'assets/js/videowalls-client.js', array());
	wp_enqueue_script('videowallsz-plugin-js');
	//CSS
	wp_register_style('videowallsz-styles-css', VIDEOWALLSZ_ROOT_URL . 'assets/css/styles.css', array());    
	wp_enqueue_style('videowallsz-styles-css');
}

function videowallsz_p_assets_admin() {

	//Enqueue admin panel scripts
	/*wp_register_script('videowallsz-admin-js', VIDEOWALLSZ_ROOT_URL . 'assets/js/admin.js', array("jquery"));
	wp_enqueue_script('videowallsz-admin-js');*/

	//Enqueue admin panel styles
	wp_register_style('videowallsz-admin-css', VIDEOWALLSZ_ROOT_URL . 'assets/css/admin-styles.css', array());    
	wp_enqueue_style('videowallsz-admin-css');
}

add_action('wp_enqueue_scripts', "videowallsz_p_assets_global");    
add_action('admin_enqueue_scripts', "videowallsz_p_assets_global");    
add_action('admin_enqueue_scripts', "videowallsz_p_assets_admin");


?>