<?php

//This file is used to register this plugin into Ziggeo plugin (making it available under Integrations tab with option to turn on and off)


//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();


//Show the entry in the integrations panel
add_filter('ziggeo_list_integration', function($integrations) {

	$current = array(
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
		'logo'					=> VIDEOWALLSZ_ROOT_URL . 'assets/images/logo.png',
		'version'				=> VIDEOWALLSZ_VERSION
	);

	//Check current Ziggeo version
	if(videowallsz_run() === true) {
		$current['status'] = true;
	}
	else {
		$current['status'] = false;
	}

	$integrations[] = $current;

	return $integrations;
});

add_action('plugins_loaded', function() {
	videowallsz_run();
});

//Function that we use to run the module 
function videowallsz_run() {

	//Needed during activation of the plugin
	if(!function_exists('ziggeo_get_version')) {
		add_action( 'admin_notices', function() {
			?>
			<div class="error notice">
				<p><?php _e( 'Please install <a href="https://wordpress.org/plugins/ziggeo/">Ziggeo plugin</a>. It is required for this plugin (Videowalls for Ziggeo) to work properly!', 'videowallsz' ); ?></p>
			</div>
			<?php
		});

		return false;
	}

	//Videowalls will be part of 2.0 and removed in 2.2 version so at that time the plugin should run, otherwise it should not to avoid duplicate codes being executed
	if(version_compare(ziggeo_get_version(), '2.0') === 0) {
		//We want to show it as enabled on the integrations page
		return true;
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
	include_once(VIDEOWALLSZ_ROOT_PATH . 'extend/settings.php');
	include_once(VIDEOWALLSZ_ROOT_PATH . 'extend/template_parser.php');
	include_once(VIDEOWALLSZ_ROOT_PATH . 'extend/videowall_parser.php');

	//Know when Videowalls will definitely be activated and do any action you want/need
	do_action('videowalls_for_ziggeo_running');

	return true;
}


?>