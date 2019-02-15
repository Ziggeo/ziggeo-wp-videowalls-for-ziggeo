<?php

//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();


//WP Dashboad > Plugins (list)

//For a link to settings in plugins screen
add_filter('plugin_action_links_videowalls-for-ziggeo/videowalls-for-ziggeo.php', 'videowallszPPluginsListingMod');

//This is not done in error, this plugin has no settings of its own, all settings are part of Ziggeo dashboard as it extends the code plugin
function videowallszPPluginsListingMod($links) {
	$links[] = '<a href="' . esc_url( get_admin_url(null, 'options-general.php?page=ziggeo_video') ) . '">' .
				_x('Settings', '"Settings" link on the Plugins page', 'ziggeo') . '</a>';
	$links[] = '<a href="mailto:support@ziggeo.com">'.
				_x('Support', '"Support" link on the Plugins page', 'ziggeo') . '</a>';
	return $links;
}
?>