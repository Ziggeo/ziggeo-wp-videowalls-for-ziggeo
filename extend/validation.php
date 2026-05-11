<?php

//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();

//Adds the videowall to the list of template tags that should be skipped in processing
add_filter('ziggeo_parameter_prep_skip_list', function($list) {
	$list[] = '[ziggeovideowall';

	return $list;
});

?>