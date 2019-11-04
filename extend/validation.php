<?php

//Adds the videowall to the list of template tags that should be skipped in processing
add_filter('ziggeo_parameter_prep_skip_list', function($list) {
	$list[] = '[ziggeovideowall';

	return $list;
});

?>