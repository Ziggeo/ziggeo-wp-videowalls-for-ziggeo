<?php

//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();

//Code used to switch from older version of the plugin (v1.15 was latest) to v2.0

//This file will run all of the updates that might be needed, per a version check.
function videowallsz_p_on_update($options = null) {

	//Is this backed or frontend?
	//We do not run this on frontend
	if(!is_admin()) {
		return false;
	}

	//Get options - we always want to do this using the standard WP way
	$options = get_option('videowallsz');

	if($options === false) {
		// fresh install
		$options = videowallsz_p_get_plugin_options();
		$options['version'] = VIDEOWALLSZ_VERSION;

		update_option('videowallsz', $options);

		return true;
	}

	//Are we already up to date?
	if(isset($options['version']) && ($options['version'] == VIDEOWALLSZ_VERSION)) {
		//All good and up to date, lets just go out of this.
		return true;
	}

	//In case this is very old version, lets make it safe for check down the road
	if(!isset($options['version']) && $options !== false) {
		$options['version'] = 0;
	}
	else {
		// another check to make sure we exist (should not come here)
		return true;
	}

	////////////////////////
	// PER VERSION UPDATES
	////////////////////////

	// 1.1
	// Info: Change first version videowall parameters into new one since they make more sense ;)
	if(version_compare($options['version'], '1.2', '<')) {

		if(function_exists('ziggeo_get_version')) {
			//Fix for template names
			$templates = ziggeo_p_templates_index();

			if(is_array($templates)) {
				//All is good, lets do it
				foreach ($templates as $template_id => $code) {

					//sometimes v2 template might be here
					if(is_array($code)) {
						continue;
					} 

					if(stripos($code, '[videowall ') > -1) {

						if(stripos($code, 'wall_design') === false) {
							if(stripos($code, 'mosaic_grid') > -1) {
								$code = str_ireplace('mosaic_grid', 'wall_design=\'mosaic_grid\'', $code);
							}
							elseif(stripos($code, 'show_pages') > -1) {
								$code = str_ireplace('show_pages', 'wall_design=\'show_pages\'', $code);
							}
							elseif(stripos($code, 'slide_wall') > -1) {
								$code = str_ireplace('slide_wall', 'wall_design=\'slide_wall\'', $code);
							}
							elseif(stripos($code, 'chessboard_grid') > -1) {
								$code = str_ireplace('chessboard_grid', 'wall_design=\'chessboard_grid\'', $code);
							}

							$templates[$template_id] = $code;
						}
					}
				}
			}

			//Save templates
			ziggeo_p_templates_add_all($templates);
		}
		else {
			add_action( 'admin_notices', function() {
				?>
				<div class="error notice">
					<p><?php _e( 'Please install <a href="https://wordpress.org/plugins/ziggeo/">Ziggeo plugin</a>. It is required for this plugin (Videowalls for Ziggeo) to work properly!', 'videowallsz' ); ?></p>
				</div>
  				<?php
			});
		}

	}

	//In the end we also update the version
	//NOTE: This should always be last
	$options['version'] = VIDEOWALLSZ_VERSION;

	update_option('videowallsz', $options);
}

add_action('plugins_loaded', 'videowallsz_p_on_update');


?>