<?php

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