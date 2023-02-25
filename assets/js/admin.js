// This file holds the codes that are used on backend (admin) side and help with different screens and pages.
//
// INDEX
//********
// 1. Helper functions
//		* jQuery.ready()
//		* videowallszPUIHooksInit()



/////////////////////////////////////////////////
// 1. HELPER FUNCTIONS                         //
/////////////////////////////////////////////////

jQuery(document).ready( function() {
	//Detect if we are within the Ziggeo Video settings
	if(document.getElementById('ziggeo-tab_id_general') || document.getElementById('ziggeo-tab_templates')) {
		videowallszPUIHooksInit();
	}
});

//Hook into the editor
function videowallszPUIHooksInit() {

	//Hooks to change the template editor in admin dashboard
	ZiggeoWP.hooks.set('template_editor_template_base_change', 'videowallsz-template-change', function(data) {
		switch(data.template) {
			//If it is video wall we want to show its parameters
			case '[ziggeovideowall': {
				var wall_info = document.getElementById('ziggeo_videowall_info');
				wall_info.style.display = 'inline-block';

				break;
			}
			default: {
				var wall_info = document.getElementById('ziggeo_videowall_info');
				wall_info.style.display = 'none';
			}
		}
	});

	//Hooks to change the template editor in admin dashboard
	ZiggeoWP.hooks.set('template_editor_template_edit', 'videowallsz-template-edit', function(data) {
		switch(data.template) {
			//If it is video wall we want to show its parameters
			case '[ziggeovideowall': {
				var wall_info = document.getElementById('ziggeo_videowall_info');
				wall_info.style.display = 'inline-block';

				break;
			}
			default: {
				var wall_info = document.getElementById('ziggeo_videowall_info');
				wall_info.style.display = 'none';
			}
		}
	});

	//Hook to remove the videowall warning
	ZiggeoWP.hooks.set('dashboard_templates_editing', 'videowallsz-template-editing', function() {
		var wall_info = document.getElementById('ziggeo_videowall_info');
		wall_info.style.display = 'none';
	});

	//Hook to work with autocomplete control in template editor
	ZiggeoWP.hooks.set('autocomplete-custom-base', 'videowallsz-templates-autocomplete-parameter', function(data) {
		if(data.template_base === 'ziggeovideowall' && typeof data.item.custom_used_by !== 'undefined' && 
					data.item.custom_used_by.indexOf('ziggeovideowall') > -1) {
			return true;
		}

		return null;
	});

}
