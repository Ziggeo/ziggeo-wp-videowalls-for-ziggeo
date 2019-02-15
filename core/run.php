<?php

//This file is used to register this plugin into Ziggeo plugin (making it available under Integrations tab with option to turn on and off)


//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();


//Show the entry in the integrations panel
add_action('ziggeo_list_integration', function() {

	$data = array(
		//This section is related to the plugin that we are combining with the Ziggeo, not the plugin/module that does it
		'integration_title'		=> 'Ziggeo Video Posts and Comments', //Name of the plugin
		'integration_origin'	=> 'https://wordpress.org/plugins/ziggeo', //Where you can download it from

		//This section is related to the plugin or module that is making the connection between Ziggeo and the other plugin.
		'title'					=> 'Videowalls for Ziggeo', //the name of the module
		'author'				=> 'Ziggeo', //the name of the author
		'author_url'			=> 'https://ziggeo.com/', //URL for author website
		'message'				=> 'Add videowalls to your pages by extending Ziggeo core plugin (At this time Ziggeo core supports videowalls directly, so you can not disable them. Direct core support will be removed and only this plugin will offer the same functionality)', //Any sort of message to show to customers
		'status'				=> true, //Is it turned on or off?
		'slug'					=> 'videowalls-for-ziggeo', //slug of the module
		//URL to image (not path). Can be of the original plugin, or the bridge
		'logo'					=> VIDEOWALLSZ_ROOT_URL . 'assets/images/logo.png'
	);

	//Check current Ziggeo version
	if(videowallsz_run() === true) {
		$data['status'] = true;
	}
	else {
		$data['status'] = false;
	}

	echo zigeo_integration_present_me($data);
});

add_action('plugins_loaded', function() {
	videowallsz_run();
});

//Function that we use to run the module 
function videowallsz_run() {

	//Needed during activation of the plugin
	if(!function_exists('ziggeo_get_version')) {
		return false;
	}

	//Check current Ziggeo version
	if( version_compare(ziggeo_get_version(), '2.0') >= 0 ) {
		if(ziggeo_integration_is_enabled('videowalls-for-ziggeo')) {
			videowallsz_init();
			return true;
		}
	}

	return false;
}

//function to allow us to disable the videowall if someone wants to
function videowallsz_init() {

	//The files that extend the core plugin
	include_once(VIDEOWALLSZ_ROOT_PATH . 'extend/assets.php');
	//include_once(VIDEOWALLSZ_ROOT_PATH . 'extend/settings.php'); //@todo - include once the core no longer provides support natively
	include_once(VIDEOWALLSZ_ROOT_PATH . 'extend/template_parser.php');
	include_once(VIDEOWALLSZ_ROOT_PATH . 'extend/videowall_parser.php');

	return true;
}


?>