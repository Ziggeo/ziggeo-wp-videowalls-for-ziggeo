<?php


//By default returns all options, or a specific one if requested. If no match is found it will return null
function videowallsz_get_options($specific = null) {

	if($specific === null) {
		return get_option('videowallsz');
	}

	$options = get_option('videowallsz');

	if(isset($options[$specific])) {
		return $options[$specific];
	}

	return null;
}

?>