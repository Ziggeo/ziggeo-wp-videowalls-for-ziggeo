<?php

//Function that will always give us the default values of a wall
function videowallsz_p_wall_defaults() {

	$defaults = array(
		'autoplay' => false,
		'autoplay-continue-end' => false,
		'autoplay-continue-run' => false,
		'fixed_height' => '',
		'fixed_width' => '',
		'message' => '',
		'on_no_videos' => 'showmessage', //showmessage, showtemplate, hidewall
		'scalable_height' => '',
		'scalable_width' => '',
		'show' => false,
		'show_videos' => 'approved', //all, approved, rejected, pending
		'template_name' => '',
		'title' => '',
		'videos_per_page' => 2,
		'videos_to_show' => '', //%CURRENT_ID%, %ZIGGEO_USER%
		'video_height' => '240',
		'video_width' => '320',
		'wall_design' => 'show_pages', //show_pages, slide_wall, chessboard_grid, mosaic_grid, videosite_playlist
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



?>