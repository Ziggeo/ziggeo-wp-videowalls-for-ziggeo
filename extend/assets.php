<?php


//Checking if WP is running or if this is a direct call..
defined('ABSPATH') or die();


//links to the background image, since CSS can not be hard coded (and make it work everywhere)
function videowallsz_css_video_wall() {
	$css = '';
	$css = apply_filters('videowallsz_assets_videowall_css', $css);

	?>
	<style type="text/css">
		.ziggeo_videowall_slide_previous {
			background-image: url("<?php echo VIDEOWALLSZ_ROOT_URL . 'assets/images/arrow-previous.png'; ?>");
		}
		.ziggeo_videowall_slide_next {
			background-image: url("<?php echo VIDEOWALLSZ_ROOT_URL . 'assets/images/arrow-next.png'; ?>");
		}
		<?php echo $css; ?>
	</style>
	<?php
}


?>