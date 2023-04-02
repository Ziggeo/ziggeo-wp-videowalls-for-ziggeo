<?php

function videowallsz_validate($input) {

	$options = videowallsz_p_get_plugin_options('videowallsz');

	$allowed_options = array(
		'enable_editor'		=> true,
		'default_design'		=> true
	);

	if(!isset($input['enable_editor']) || $input['enable_editor'] === '0') {
		$options['enable_editor'] = '0';
	}
	else {
		$options['enable_editor'] = '1';
	}

	$options['default_design'] = $input['default_design'];

	return $options;
}

?>