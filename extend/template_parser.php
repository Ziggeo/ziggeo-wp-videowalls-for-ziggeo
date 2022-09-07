<?php


//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();


//function to get the nice aray of the video wall parameters and values, so that we do not cluter the main function too much
function videowallsz_videowall_parameter_values($to_parse) {

	$parsed = array();

	// templates v2 support
	if(is_array($to_parse)) {
		$to_parse = $to_parse['params'];
		$to_parse = str_replace("\'", "'", $to_parse);
	}
	else {
		// Seems to not be the case with templates v2

		//When loaded from DB it will have double quote even if we saved it with asterisk...
		$to_parse = str_replace('"', "'", $to_parse);
	}

	//VideoWall Title
	if( ($t = stripos($to_parse, ' title=')) > -1 ) {
		//Lets get the title then
		//title=\'wall title\'
		$parsed['title'] = substr($to_parse, $t+8, stripos($to_parse, "'", $t+8) - ($t + 8));

		//get parameters and values prior to title parameter
		$tmp = substr($to_parse, 0, $t) . ' ';
		//get values after the title parameter and its values ( position + (starting space + parameter + = ) + length of parameter value + quotes )
		$tmp .= substr($to_parse, $t + 8 + strlen($parsed['title']) + 2);

		$to_parse = $tmp;
	}

	//No videos message
	if( ($t = stripos($to_parse, ' message=')) > -1 ) {

		//Lets get the message then
		$parsed['message'] = substr($to_parse, $t+10, stripos($to_parse, "'", $t+10) - ($t + 10) );

		//get parameters and values prior to message parameter
		$tmp = substr($to_parse, 0, $t) . ' ';
		//get values after the message parameter and its values ( position + (starting space + parameter + = ) + length of parameter value + quotes )
		$tmp .= substr($to_parse, $t + 10 + strlen($parsed['message']) + 2);

		$to_parse = $tmp;
	}

	//no videos template_name
	if( ($t = stripos($to_parse, ' template_name=')) > -1 ) {
		//Lets get the template_name then
		$parsed['template_name'] = substr($to_parse, $t+16, stripos($to_parse, "'", $t+16) - ($t + 16));

		//get parameters and values prior to template_name parameter
		$tmp = substr($to_parse, 0, $t) . ' ';
		//get values after the template_name parameter and its values ( position + (starting space + parameter + = ) + length of parameter value + quotes )
		$tmp .= substr($to_parse, $t + 16 + strlen($parsed['template_name']) + 2);

		$to_parse = $tmp;
	}

	//We can now split the rest with explode()

	$tmp = explode(' ', $to_parse);

	foreach($tmp as $key => $value) {
		$value = trim($value, " \t\n\r\0\x0B".chr(0xC2).chr(0xA0));
		if( $value !== '' && $value !== ']' && $value !== '""'&& $value !== '"'
			&& $value !== 'wall') {
				//explode on = and trim ' and "
				$t = explode('=', $value);
				if(isset($t[1])) {
					$parsed[$t[0]] = trim($t[1], "'");
				}
				else {
					$parsed[$t[0]] = true;
				}
		}
	}

	return $parsed;
}

?>