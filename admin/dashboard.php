<?php

//Used for setting up the options on the admin side

// Index
//	1. Hooks
//		1.1. admin_init
//		1.2. admin_menu
//	2. Fields and sections
//		2.1. videowallsz_show_form()
//		2.2. videowallsz_o_section()
//		2.3. videowallsz_o_enable_editor()
//		2.4. videowallsz_o_default_design()


//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();

	//For now the page is not going to be shown since it does not have its own settings, just the ons in the editor

	//To add settings like (@here):
	//	1. To activate the hooks for the core editor (simple and advanced)
	//	2. Default videowall desigs


/////////////////////////////////////////////////
//	1. HOOKS
/////////////////////////////////////////////////

	//Add plugin options
	add_action('admin_init', function() {
		//Register settings
		register_setting('videowallsz', 'videowallsz', array(
															'sanitize_callback' => 'videowallsz_validate',
															'default'			=> array(
																'enable_editor'		=> '1',
																'default_design'		=> 'slide_wall'
															)
		));

		//Active hooks
		add_settings_section('videowallsz_o_section', '', 'videowallsz_o_section', 'videowallsz');


			// 
			add_settings_field('videowallsz_enable_editor',
								__('Enable Editor', 'videowallsz'),
								'videowallsz_o_enable_editor',
								'videowallsz',
								'videowallsz_o_section');

			// 
			add_settings_field('videowallsz_default_design',
								__('Default design', 'videowallsz'),
								'videowallsz_o_default_design',
								'videowallsz',
								'videowallsz_o_section');
	});

	add_action('admin_menu', function() {

		if(function_exists('ziggeo_p_add_addon_submenu')) {
			ziggeo_p_add_addon_submenu(array(
				'page_title'	=> 'VideoWalls for Ziggeo Video',		//page title
				'menu_title'	=> 'VideoWalls for Ziggeo Video',		//menu title
				'capability'	=> 'manage_options',					//min capability to view
				'slug'			=> 'videowallsz',						//menu slug
				'callback'		=> 'videowallsz_show_form')				//function
			);
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


	}, 12);




/////////////////////////////////////////////////
//	2. FIELDS AND SECTIONS
/////////////////////////////////////////////////

	//Dashboard form
	function videowallsz_show_form() {
		?>
		<div class="ziggeo_dashboard_settings">
			<h2>Ziggeo VideoWalls</h2>

			<form action="options.php" method="post" enctype="multipart/form-data">
				<?php
				wp_nonce_field('videowallsz_nonce_action', 'videowallsz_video_nonce');
				settings_errors();
				settings_fields('videowallsz');
				do_settings_sections('videowallsz');
				submit_button('Save Changes');
				?>
			</form>
		</div>
		<?php
	}

		function videowallsz_o_section() {
			_e('VideoWall plugin hooks into Ziggeo core plugin and makes changes to it per these settings', 'videowallsz');
		}

			function videowallsz_o_enable_editor() {
				$option = videowallsz_p_get_plugin_options('enable_editor');

				?>
				<input id="videowallsz_enable_editor" name="videowallsz[enable_editor]" size="50" type="checkbox" value="1" <?php echo checked( 1, $option, false ); ?>/>
				<label for="videowallsz_enable_editor"><?php _e('When checked videowalls will be added to the templates editor', 'videowallsz'); ?></label>
				<?php
			}

			function videowallsz_o_default_design() {
				$option = videowallsz_p_get_plugin_options('default_design');

				?>
				<select id="videowallsz_default_design" name="videowallsz[default_design]">
					<option <?php echo ($option === 'slide_wall')? 'selected="selected"' : ''; ?> value="slide_wall">Slide Wall</option>
					<option <?php echo ($option === 'show_pages')? 'selected="selected"' : ''; ?> value="show_pages">Show Pages</option>
					<option <?php echo ($option === 'mosaic_grid')? 'selected="selected"' : ''; ?> value="mosaic_grid">Mosaic Grid</option>
					<option <?php echo ($option === 'chessboard_grid')? 'selected="selected"' : ''; ?> value="chessboard_grid">Chessboard Grid</option>
					<option <?php echo ($option === 'videosite_playlist')? 'selected="selected"' : ''; ?> value="videosite_playlist">VideoSite Playlist</option>
					<option <?php echo ($option === 'stripes')? 'selected="selected"' : ''; ?> value="stripes">Stripes</option>
				</select>
				<label for="videowallsz_default_design"><?php _e('What design should be used by default?', 'videowallsz'); ?></label>
				<?php
			}


?>