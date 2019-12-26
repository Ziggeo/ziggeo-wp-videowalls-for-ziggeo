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
//		2.4. videowallsz_o_global_design()


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
																'global_design'		=> 'slide_wall'
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
			add_settings_field('videowallsz_global_design',
								__('Global design', 'videowallsz'),
								'videowallsz_o_global_design',
								'videowallsz',
								'videowallsz_o_section');
	});

	add_action('admin_menu', function() {
		add_submenu_page(
			'ziggeo_video',					//parent slug
			'VideoWalls for Ziggeo Video',	//page title
			'VideoWalls for Ziggeo Video',	//menu title
			'manage_options',				//min capability to view
			'videowallsz',					//menu slug
			'videowallsz_show_form'			//function
		);
	});




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
				$options = get_option('videowallsz');

				if(!isset($options['enable_editor']) ) {
					$options['enable_editor'] = '1';
				}

				?>
				<input id="videowallsz_enable_editor" name="videowallsz[enable_editor]" size="50" type="checkbox" value="1" <?php echo checked( 1, $options['enable_editor'], false ); ?>/>
				<label for="videowallsz_enable_editor"><?php _e('When checked videowalls will be added to the templates editor', 'videowallsz'); ?></label>
				<?php
			}

			function videowallsz_o_global_design() {
				$options = get_option('videowallsz');

				if(!isset($options['global_design']) ) {
					$options['global_design'] = 'slide_wall';
				}

				?>
				<select id="videowallsz_global_design" name="videowallsz[global_design]">
					<option <?php echo ($options['global_design'] === 'slide_wall')? 'selected="selected"' : ''; ?> value="slide_wall">Slide Wall</option>
					<option <?php echo ($options['global_design'] === 'show_pages')? 'selected="selected"' : ''; ?> value="show_pages">Show Pages</option>
					<option <?php echo ($options['global_design'] === 'mosaic_grid')? 'selected="selected"' : ''; ?> value="mosaic_grid">Mosaic Grid</option>
					<option <?php echo ($options['global_design'] === 'chessboard_grid')? 'selected="selected"' : ''; ?> value="chessboard_grid">Chessboard Grid</option>
				</select>
				<label for="videowallsz_global_design"><?php _e('What design should be used by default?', 'videowallsz'); ?></label>
				<?php
			}


?>