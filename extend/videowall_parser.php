<?php

//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();

//Function to get the start and end of the videowall
function videowallsz_get_wall_placeholder($inline_styles) {
	//Since there could be several walls on the same page, it would be best to create some random id that will help distinguish the x from y
	$wallID = 'ziggeo_video_wall' . rand(2,4) . str_replace(array(' ', '.'), '', microtime()) . rand(0,5); ///ziggeo_video_wall0363734001464901560

	$code = '<div id="' . $wallID . '" class="ziggeo_videoWall" style="' . $inline_styles . '">';

	return array(
		'wall_id'			=> $wallID,
		'div_code_start'	=> $code,
		'div_code_end'		=> '</div>'
	);
}

add_filter('ziggeo_template_parser_type_ziggeovideowall', function($template) {
	return videowallsz_content_parse_videowall($template, false);
});

//$post_code - to see if we should post the code to the page or return it back
function videowallsz_content_parse_videowall($template, $post_code = false) {

	$current_user = ziggeo_p_get_current_user();

	$c_user = ( $current_user->user_login == "" ) ? 'Guest' : $current_user->user_login;

	// Let's check if this is template name or not
	if(!is_array($template)) {
		$t_template = ziggeo_p_template_exists($template);

		if($t_template !== false) {
			$template = stripslashes($t_template);
		}
	}

	$wall = videowallsz_videowall_parameter_values($template);
	$wall = videowallsz_p_populate_template($wall);

	//To set up the wall inline style
	$wall_styles = '';

	//It would not be possible to use pixels and percentages in the same time, so to avoid bad HTML and CSS code percentages will rule the pixels when both are set
	if($wall['scalable_width'] === '' && $wall['fixed_width'] !== '') {
		$wall_styles .= 'width:' . trim($wall['fixed_width'], " \t\n\r\0\x0B".chr(0xC2).chr(0xA0)) . 'px;';
	}

	if($wall['scalable_height'] === '' && $wall['fixed_height'] !== '') {
		$wall_styles .= 'height:' . trim($wall['fixed_height'], " \t\n\r\0\x0B".chr(0xC2).chr(0xA0)) . 'px;';
	}

	if($wall['scalable_width'] !== '') {
		$wall_styles .= 'width:' . trim($wall['scalable_width'], " \t\n\r\0\x0B".chr(0xC2).chr(0xA0)) . '%;';
	}

	if($wall['scalable_height'] !== '') {
		$wall_styles .= 'height:' . trim($wall['scalable_height'], " \t\n\r\0\x0B".chr(0xC2).chr(0xA0)) . '%;';
	}

	if($wall['show'] === true) {
		$wall_styles .= 'display:block;';
	}
	else {
		$wall_styles .= 'display:none;';
	}

	$ret = '';
	$wall_structure = videowallsz_get_wall_placeholder($wall_styles);
	$wallID = $wall_structure['wall_id'];
	$ret = $wall_structure['div_code_start'];

	//Does wall have the title parameter set up?
	if($wall['title'] !== '' ) {
		//Lets get the title then
		$wall['title'] = '<div class="ziggeo_wall_title">' . $wall['title'] . '</div>';
	}
	else {
		//will be needed because of CSS
		$wall['title'] = '<div class="ziggeo_wall_title" style="display:none"></div>';
	}

	//We will change the way the design of the wall is set to minimize the amount of parameters being one parameter with many designs, over multiple
	// parameters with different names that determine which design is used

	//show_pages is default, so if slide_wall is set, it will be used over show_pages
	if( $wall['wall_design'] === 'slide_wall' ) {
		//videos per page
		if($wall['videos_per_page'] !== '') { $wall['videos_per_page'] = 1; }
	}
	elseif( $wall['wall_design'] === 'chessboard_grid' ) {
		 //videos per page
		if($wall['videos_per_page'] !== '') { $wall['videos_per_page'] = 20; }
	}
	elseif($wall['wall_design'] === 'mosaic_grid' ) {
		//videos per page
		if($wall['videos_per_page'] !== '') { $wall['videos_per_page'] = 20; }
	 }
	 elseif($wall['wall_design'] === 'videosite_playlist' ) {

		if($wall['videos_per_page'] !== '') { $wall['videos_per_page'] = 100; }
	 }
	 elseif($wall['wall_design'] === 'stripes' ) {

		if($wall['videos_per_page'] !== '') { $wall['videos_per_page'] = 50; }
	 }
	 else {
		//Something seems off, raise notification
		//@TODO: Add notification
	 }

	//lets set the post ID since we will need to reference it as tag
	$wall['postID'] = get_the_ID();

	//Is there a message set in of no videos? If not, we should make some:
	if($wall['message'] === '') {
		$wall['message'] = 'Currently no videos found. We do suggest recording some first';
	}

	//We are parsing template only if it is set to be shown, otherwise there is no need for it.
	if($wall['on_no_videos'] === 'showtemplate') {
		//Did we set up a template to be loaded into the videowall if there are no videos?
		if($wall['template_name'] !== '') {
			$wall['template_name'] = ziggeo_p_template_params($wall['template_name']);

			//template was not found lets use the defaults
			if($wall['template_name'] === false) {
				$wall['template_name'] = ZIGGEO_RECORDER_DEFAULT;
			}
			else {
				$wall['template_name'] = str_ireplace("'", '"', $wall['template_name']);
				$wall['template_name'] = ziggeo_p_parameter_prep($wall['template_name']);
			}
		}
	}

	if(!isset($wall['pre_set_list'])) {
		$wall['pre_set_list'] = '';
	}

	//In case video wall should be hidden if empty
	if($wall['on_no_videos'] === 'hidewall') {
		$wall['hide_wall'] = true;
	}
	else {
		$wall['hide_wall'] = false;
	}

	$autoplaytype = '';

	if($wall['autoplay'] === true || $wall['autoplay'] === 'true') {
		$wall['autoplay'] = true; // Just to make it easier

		//autoplay is set, so we check if any of the other 2 options are set as well:
		if($wall['autoplay-continue-end'] === true || $wall['autoplay-continue-end'] === 'true') {
			$autoplaytype = 'continue-end';
		}
		elseif($wall['autoplay-continue-run'] === true || $wall['autoplay-continue-run'] === 'true') {
			$autoplaytype = 'continue-run';
		}
	}

	//To handle search and everything, we will use JS, otherwise we would need to include SDK (which would be OK, however it would also cause a lot more code to be present and would be hard to update if needed)
	//to use it through client side, we will now build JS templates which will be outputted to the page.


	//We want it to output this only once. It is no problem if we do it hundreds of times, since the images would only be loaded once and no conflicts would be made, however doing that would cause the page to be filled out with non required code, so this makes it nicer.
	if(!wp_style_is('ziggeo_wall_images', 'done')) {
		//Lets make sure we mark it as done..
		global $wp_styles;
		$wp_styles->done[] = 'ziggeo_wall_images';

		//Lets also add the code into the header, so it is not in the page content area..
		add_action('wp_footer', 'videowallsz_css_video_wall');
	}

	//We now allow customers to set custom tags to search videos by..This will provide them with more freedom.
	// good to note that we should search using tags, by default, this is to fine tune the results that are matching the
	// post ID tag.
	$wall_tags = '';

	if($wall['videos_to_show'] === false) { //it was not set..
		$wall_tags = 'wordpress,comment,post_' . $wall['postID']; //default that shows the videos made in the comments of the specific post
	}
	else {
		$wall_tags = $wall['videos_to_show'];
	}

	//added to allow the video wall to process videos of the current user without requiring the PHP code to run it
	$wall_tags = str_replace( '%ZIGGEO_USER%', $c_user, $wall_tags );

	//tags based on current page
	$wall_tags = str_replace( '%CURRENT_ID%', $wall['postID'], $wall_tags );
	$wall_tags = apply_filters('ziggeo_template_parsing_tag_set', $wall_tags, current_filter());
	// fix the escaped quotes that might be present
	$wall_tags = str_replace(array("'", '\\'), '', $wall_tags);

	$wall['autoplay'] = ($wall['autoplay'] === true) ? 'true' : 'false';
	$showtemplate = ($wall['on_no_videos'] === 'showtemplate') ? 'true' : 'false';
	$wall['hide_wall'] = ($wall['hide_wall']) ? 'true' : 'false';

	if(!isset($wall['video_stretch']) || $wall['video_stretch'] === '' || $wall['video_stretch'] === 'none') {
		$wall['video_stretch'] = false;
	}

	//This way we force it to be integer even if some text is passed by mistake.
	//Devs: Please note that setTimeout function will always have a delay of it's own.
	//      Even if you set it up with 0 it will have a delay of approx 200 ms.
	//      Please also note that this will have to be higher if the page / location you are placing
	//      the videowall does not load all resources until some time has passed (for example has lazy load)
	$wall['show_delay'] = (int)$wall['show_delay'] * 1000;

	//closing videowall div
	$ret .= $wall_structure['div_code_end'];

	ob_start();

	//This helps us create js code that works as is and uses the variable data from these outputs instead of outputting the data into the code each time - and adding JS directly to the page.
	?>
	<script type="text/javascript" class="runMe">
		videowallszCreateWall('<?php echo $wallID; ?>', {
				videos: {
					width: '<?php echo str_replace(array("'", '\\'), '', $wall['video_width']); ?>',
					height: '<?php echo str_replace(array("'", '\\'), '', $wall['video_height']); ?>',
					autoplay: <?php echo $wall['autoplay']; ?>,
					autoplaytype: '<?php echo $autoplaytype; ?>',
					stretch: '<?php echo $wall['video_stretch']; ?>'
				},
				indexing: {
					perPage: <?php echo str_replace(array("'", '\\'), '', $wall['videos_per_page']); ?>,
					status: '<?php echo str_replace(array("'", '\\'), '', $wall['show_videos']); ?>',
					design: '<?php echo str_replace(array("'", '\\'), '', $wall['wall_design']); ?>',
					fresh: true,
					auto_refresh: <?php echo (int)$wall['auto_refresh']; ?>,
					pre_set_list: '<?php echo $wall['pre_set_list']; ?>',
				},
				onNoVideos: {
					showTemplate: <?php echo $showtemplate; ?>,
					message: '<?php echo $wall['message']; ?>',
					templateName: '<?php echo $wall['template_name']; ?>',
					hideWall: <?php echo $wall['hide_wall']; ?>
				},
				title: '<?php echo $wall['title']; ?>',
				tags: '<?php echo $wall_tags; ?>' //the tags to look the video by based on template setup
			});
	</script>
	<?php

	$ret .= ob_get_contents();
	ob_end_clean();

	//Video wall will by default only show when the video comment is submitted, unless this is overridden by the `show` parameter
	ob_start();

	if( !isset($wall['show']) ) {
		//wait for video submission first
		?>
		<script type="text/javascript" class="runMe">
			//just to make sure that it is available
			//we could add to check the embedding in order to fire only if right embedding is shown..
			//There are different ways our code can be added, this should cover all cases.
			setTimeout(function() {
				if(typeof ziggeo_app !== 'undefined') {
					ziggeo_app.embed_events.on('verified', function (embedding) {
						videowallszUIVideoWallShow('<?php echo $wallID; ?>');
					});
				}
				//lets wait for a second and try again.
				else {
					setTimeout( function() {
						ziggeo_app.embed_events.on('verified', function (embedding) {
							videowallszUIVideoWallShow('<?php echo $wallID ?>');
						});
					}, 10000 );
					//10 seconds should be enough for page to load and we do not need to have this set up right away.
				}
			}, 4000);
		</script>
		<?php
	}
	else {
		//video wall must be shown right away..
		?>
		<script type="text/javascript" class="runMe">
			jQuery(document).ready( function () {
				//Turns out we sometimes need a bit more time (needed for some integrations)
				setTimeout(function() {
					videowallszUIVideoWallShow('<?php echo $wallID; ?>');
				}, '<?php echo $wall['show_delay']; ?>');
			});
		</script>
		<?php
	}

	if($post_code === true) {
		echo $ret;
	}
	else {
		return $ret;
	}
}


//handles the raw parameters for the ziggeo videowall..
function videowallsz_prep_parameters_videowall($raw_parameters = null) {

	if($raw_parameters === null) {
		return '';
	}

	return $raw_parameters;
}

//Shortcode handling for Ziggeo Video Walls
add_shortcode( 'ziggeovideowall', function($attrs) {

	if(function_exists('ziggeo_p_shortcode_handler')) {
		return ziggeo_p_shortcode_handler('[ziggeovideowall', $attrs);
	}
	else {
		ziggeo_notification_create('ziggeovideowall shortcode was used, however looks like the Ziggeo core plugin is not yet up to date. Please update the Ziggeo core plugin.');
	}

});

?>