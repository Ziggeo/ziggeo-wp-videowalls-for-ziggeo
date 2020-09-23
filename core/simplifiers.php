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
		'show_videos'               => 'approved', //all, approved, rejected, pending
		'template_name'             => '',
		'title'                     => '',
		'videos_per_page'           => 2,
		'videos_to_show'            => '', //%CURRENT_ID%, %ZIGGEO_USER%
		'video_height'              => '240',
		'video_width'               => '320',
		'video_stretch'             => 'none', //none, all, by_height, by_width
		'wall_design'               => 'show_pages', //show_pages, slide_wall, chessboard_grid, mosaic_grid, videosite_playlist
	);

	return $defaults;
}

//Function that we use to grab the template values and then add to them the defaults as well, so we have fine tuned code respecting the defaults
function videowallsz_p_populate_template($template) {

	$defaults = videowallsz_p_wall_defaults();

	foreach($defaults as $default => $value) {
		if(!isset($template[$default])) {
			$template[$default] = $value;
		}
	}

	return $template;

}

function videowallsz_p_get_plugin_options_defaults() {
	$defaults = array(
		'enable_editor'			=> '1',
		'global_design'			=> 'slide_wall'
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


?>