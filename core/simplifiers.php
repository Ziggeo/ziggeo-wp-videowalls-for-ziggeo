<?php

//Function that will always give us the default values of a wall
function videowallsz_p_wall_defaults() {

	$defaults = array(
		'autoplay'                  => false,
		'autoplay-continue-end'     => false,
		'autoplay-continue-run'     => false,
		'auto_refresh'              => 0, //0 for never, any other number is equal to seconds of wait.
		'fixed_height'              => '',
		'fixed_width'               => '',
		'message'                   => '',
		'on_no_videos'              => 'showmessage', //showmessage, showtemplate, hidewall
		'scalable_height'           => '',
		'scalable_width'            => '',
		'show'                      => false,
		'show_delay'                => 2,
		'show_videos'               => '', //all, approved, rejected, pending
		'template_name'             => '',
		'title'                     => '',
		'videos_per_page'           => 2,
		'videos_to_show'            => '', //%CURRENT_ID%, %ZIGGEO_USER%
		'video_height'              => '240',
		'video_width'               => '320',
		'video_stretch'             => 'none', //none, all, by_height, by_width
		'wall_design'               => 'show_pages', //show_pages, slide_wall, chessboard_grid, mosaic_grid, videosite_playlist, stripes
	);

	return $defaults;
}

//Function that we use to grab the template values and then add to them the defaults as well, so we have fine tuned code respecting the defaults
function videowallsz_p_populate_template($template) {

	$defaults = videowallsz_p_wall_defaults();
	$plugin_settings = videowallsz_p_get_plugin_options();

	foreach($defaults as $default => $value) {
		if(!isset($template[$default])) {
			if($default === 'wall_design') {
				$template[$default] = $plugin_settings['default_design'];
			}
			else {
				$template[$default] = $value;
			}
		}
	}

	return $template;

}

function videowallsz_p_get_plugin_options_defaults() {
	$defaults = array(
		'enable_editor'			=> '1',
		'default_design'		=> 'slide_wall'
	);

	return $defaults;
}

// Returns all plugin settings or defaults if not existing
function videowallsz_p_get_plugin_options($specific = null) {
	$options = get_option('videowallsz');

	$defaults = videowallsz_p_get_plugin_options_defaults();

	//in case we need to get the defaults
	if($options === false || $options === '') {
		// the defaults need to be applied
		$options = $defaults;
	}

	// In case we are after a specific one.
	if($specific !== null) {
		if(isset($options[$specific])) {
			return $options[$specific];
		}
		elseif(isset($defaults[$specific])) {
			return $defaults[$specific];
		}
	}
	else {
		return $options;
	}

	return false;
}

// a simple function to test if the code is videowall code or not
function videowallsz_p_is_videowall_code($code = '') {

	if((strpos($code, '[videowall') > -1) || (strpos($code, 'ziggeo_video_wall') > -1)) {
		return true;
	}

	return false;
}

// Code that runs only when the plugin is running
add_action('videowalls_for_ziggeo_running', function() {

	// We use this filter to tell the core plugin that the videowall templates should not be pre-rendered
	// * note: At this time pre-rendering this type of templates will output HTML and JS code, so it needs
	// to be handled in a bit different manner
	add_filter('ziggeo_template_validation_pre_render', function($base, $should_prerender) {
		switch(strtolower($base)) {
			case '[ziggeovideowall':
				return false;
				break;
			default:
				return $base;
				break;
		}
	}, 10, 2);
});

?>