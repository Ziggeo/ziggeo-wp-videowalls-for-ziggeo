<?php

//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();


function videowallsz_p_assets_global() {
	// Ziggeo JS SDK is added through Ziggeo Video plugin. Please download and install it first, then add this one to extend the base Ziggeo plugin with videowalls

	//js
	wp_register_script('videowallsz-plugin-js', VIDEOWALLSZ_ROOT_URL . 'assets/js/client.js', array("jquery"));
	wp_enqueue_script('videowallsz-plugin-js');
	//CSS
	wp_register_style('videowallsz-styles-css', VIDEOWALLSZ_ROOT_URL . 'assets/css/styles.css', array());    
	wp_enqueue_style('videowallsz-styles-css');
}

function videowallsz_p_assets_admin() {

	//Enqueue admin panel scripts
	wp_register_script('videowallsz-admin-js', VIDEOWALLSZ_ROOT_URL . 'assets/js/admin.js', array("jquery"));
	wp_enqueue_script('videowallsz-admin-js');

	//Enqueue admin panel styles
	wp_register_style('videowallsz-admin-css', VIDEOWALLSZ_ROOT_URL . 'assets/css/admin-styles.css', array());    
	wp_enqueue_style('videowallsz-admin-css');
}

add_action('wp_enqueue_scripts', "videowallsz_p_assets_global");    
add_action('admin_enqueue_scripts', "videowallsz_p_assets_global");    
add_action('admin_enqueue_scripts', "videowallsz_p_assets_admin");


//Adds the videowall URLs into the header that is exported to be used by other plugins if iframe has to be created.
add_filter('ziggeo_assets_init_raw_post', function($links) {
	$links[] = array(
		'js'	=> VIDEOWALLSZ_ROOT_URL . 'assets/js/client.js',
		'css'	=> VIDEOWALLSZ_ROOT_URL . 'assets/css/styles.css'
	);

	return $links;
});


?>