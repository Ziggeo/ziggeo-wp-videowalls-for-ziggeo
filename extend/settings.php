<?php

//This file extends the Ziggeo plugin Admin > Settings*.php files
//This file is currently not included by this plugin to avoid duplicate entries.


//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();


//Add the videowall template to the list of templates that are available in the admin (plugin settings)
add_filter('ziggeo_setting_available_templates', function($templates) {
	//lets add videowall template..
	$templates[] = array(
						'value' => '[ziggeovideowall',
						'string' => _x('Ziggeo VideoWall', 'videowalls-for-ziggeo')
	);

	return $templates;
});

//add videowall parameter into the list of content parsers available
add_action('ziggeo_manage_template_options_pre', function($existing_templates) {
	$existing_templates[] = array(
								'name'			=> 'ziggeovideowall',
								'func_pre'		=> 'videowallsz_prep_parameters_videowall',
								'func_final'	=> 'videowallsz_content_parse_videowall'
	);

	return $existing_templates;
});

//add videowall parameter into the list of content parsers available
add_filter('ziggeo_content_filter_supported_codes_single', function($supported) {
	$supported[] = 'ziggeovideowall';
	return $supported;
});

//Add videowall parameters to the plugin
//IMPORTANT: This has priority of 1 so that it fires as soon as possible. That way we add video wall parameters right away. If you want to add additional video wall parameters, you should have those set on the default priority instead.
add_filter('ziggeo_template_parameters_list', function($parameters_list) {

	$wall_parameters = array(
		'fixed_width' => array(
			'type'                  => 'integer',
			'description'           => _x('Integer value representing fixed width of the video wall', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => false,
			'default_value'         => ''
		),
		'fixed_height' => array(
			'type'                  => 'integer',
			'description'           => _x('Integer value representing fixed height of the video wall', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => false,
			'default_value'         => ''
		),
		'scalable_width' => array(
			'type'                  => 'float',
			'description'           => _x('Float value representing width of the video wall in percentages of the available space', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => false,
			'default_value'         => ''
		),
		'scalable_height' => array(
			'type'                  => 'float',
			'description'           => _x('Float value representing height of the video wall in percentages of the available space', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => false,
			'default_value'         => ''
		),
		'title' => array(
			'type'                  => 'string',
			'description'           => _x('String value representing title of the video wall - always shown on top', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => ''
		),
		'wall_design' => array(
			'type'                  => 'enum',
			'description'           => _x('This property allows you to change the initial design of your video wall. Default is show_pages', 'videowalls-for-ziggeo'),
			'options'                => array('show_pages', 'slide_wall', 'chessboard_grid', 'mosaic_grid', 'videosite_playlist', 'stripes'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => 'show_pages'
		),
		'videos_per_page' => array(
			'type'                  => 'integer',
			'description'           => _x('Integer value determining how many videos should be shown per page (defaults: 1 with slide_wall and 2 with show_pages)', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => 2
		),
		'video_stretch' => array(
			'type'                  => 'enum',
			'description'           => _x('Choose if you want any type of stretching being applied on the video players within the video wall.', 'videowalls-for-ziggeo'),
			'options'                => array('none', 'all', 'by_height', 'by_width'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => 'none'
		),
		'videos_to_show' => array(
			'type'                  => 'array',
			'description'           => _x('Array to setup which videos should be shown. Default video wall shows videos made on post it is on. This accepts comma separated values of post IDs (format: `post_ID`) or any other tags. Adding just &apos;&apos; (two single quotes) will show all videos in your account (videos_to_show=&apos;&apos;)', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => '%CURRENT_ID%'
		),
		'video_width' => array(
			'type'                  => 'integer',
			'description'           => _x('Integer value representing the width of each video in the wall', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => '320'
		),
		'video_height' => array(
			'type'                  => 'integer',
			'description'           => _x('Integer value representing the height of each video in the wall', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => '240'
		),
		'on_no_videos' => array(
			'type'                  => 'enum',
			'description'           => _x('Array value representing what should happen if there are no videos.', 'videowalls-for-ziggeo'),
			'options'                => array('showmessage', 'showtemplate', 'hidewall'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => 'showmessage'
		),
		'message' => array(
			'type'                  => 'string',
			'description'           => _x('String value that will be shown if `on_no_videos` is set to `showmessage`', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => ''
		),
		'template_name' => array(
			'type'                  => 'string',
			'description'           => _x('String value holding the name of the video template that you want to show if the `on_no_videos` is set to `showtemplate` (if it does not exist default is loaded)', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => ''
		),
		'show_videos' => array(
			'type'                  => 'enum',
			'description'           => _x('Array value stating which videos will be shown.', 'videowalls-for-ziggeo'),
			'options'                => array('all', 'approved', 'rejected', 'pending'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => 'approved'
		),
		'autoplay' => array(
			'type'                  => 'bool',
			'description'           => _x('Boolean value indicating if first video should be played automatically.', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => false
		),
		'autoplay-continue-end' => array(
			'type'                  => 'bool',
			'description'           => _x('Boolean value indicating that you want the autoplay of second video to start when playback of first one ends and to continue until the end of the (first) page (requires `autoplay`)', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => false,
			'default_value'         => false
		),
		'autoplay-continue-run' => array(
			'type'                  => 'bool',
			'description'           => _x('Boolean value indicating that you want the autoplay of second video to start when playback of first one ends and to continue until the end of the (first) page is met, then start again (looping through all videos on the page one by one) - (requires `autoplay`)', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => false,
			'default_value'         => false
		),
		'auto_refresh' => array(
			'type'                  => 'integer',
			'description'           => _x('Integer representing the number of seconds to wait before checking if there is any new video available. Zero turns it off', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => false,
			'default_value'         => 0
		),
		'show' => array(
			'type'                  => 'bool',
			'description'           => _x('Boolean value indicating if video wall is shown even if the video is not submitted (defaults to waiting for submission of a video to show the video wall, adding this shows it right away)', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => false
		),
		'show_delay' => array(
			'type'                  => 'integer',
			'description'           => _x('Number of seconds to pass for videowall to be shown. Defaults to 2seconds as lower numbers might not work in different parts of Wordpress.)', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => 2
		),
		'pre_set_list' => array(
			'type'                  => 'string',
			'description'           => _x('Comma separated list of video tokens for when you want your wall to only show specific set of videos)', 'videowalls-for-ziggeo'),
			'used_by_player'        => false,
			'used_by_recorder'      => false,
			'used_by_rerecorder'    => false,
			'used_by_uploader'      => false,
			'custom_used_by'        => 'ziggeovideowall',
			'advanced'              => true,
			'simple'                => true,
			'default_value'         => ''
		)
	);

	$parameters_list['wall'] = $wall_parameters;

	return $parameters_list;
}, 1);

//Shows a message about the VideoWall parameters right above the template editor
add_action('ziggeo_settings_before_editor', function($templates) {
	?>
	<p id="ziggeo_videowall_info" style="display:none;">
		<span class="ziggeo_info"><?php
			_ex('Video Wall template (by default) shows videos made on the post the videwall template is on. If you wish to change it to show other videos, just add', 'videowall info 1/3', 'videowalls-for-ziggeo');
			?> <b onclick="ziggeoPUIParametersQuickAdd({ currentTarget:this});" data-equal="=''"><?php
				_ex('videos_to_show', 'videowall info 2/3', 'videowalls-for-ziggeo');
			?></b> <?php
			_ex('and modify it to your needs', 'videowall info 3/3', 'videowalls-for-ziggeo'); ?></span>
		<span>For more info about Videowall parameters please <a href="https://ziggeo.com/docs/integrations/wordpress/videowalls/">head over to our docs</a></span>
	</p>
	<?php
});

//Adds the videowall parameters into easy template editor
add_action('ziggeo_templates_editor_easy_parameters_section', function($sections) {
	if(!in_array('wall', $sections)) {
		$sections[] = 'wall';
	}

	return $sections;
});

//Adds the videowall parameters into advanced template editor
add_action('ziggeo_templates_editor_advanced_parameters_section', function($sections) {
	if(!in_array('wall', $sections)) {
		$sections[] = 'wall';
	}

	return $sections;
});


?>