<?php

//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();

//Add the walls array within the ZiggeoWP object so videowalls work fine
add_action('ziggeo_add_to_ziggeowp_object', function() {
	?>
	videowalls: {
		endless: '',
		walls: []
	},
	<?php
});

?>