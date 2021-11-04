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

	var _hooks = ['dashboard_parameters_editor-adv', 'dashboard_parameters_editor-easy'];

	//Hooks to change the template editor in admin dashboard
	ZiggeoWP.hooks.set(_hooks, 'videowallsz-template-change', function(data) {
		switch(data.template) {
			//If it is video wall we want to show its parameters
			case '[ziggeovideowall': {
				
				var wallInfo = document.getElementById('ziggeo_videowall_info');
				wallInfo.style.display = 'inline-block';

				data.editor.value = data.template + ' ';

				if(data.editor_type == 'advanced') {
					document.getElementById('ziggeo-wall-parameters-adv').style.display = 'block';
				}
				else {
					document.getElementById('ziggeo-wall-parameters-easy').style.display = 'block';
				}

				break;
			}
			default: {
				
				var wallInfo = document.getElementById('ziggeo_videowall_info');
				wallInfo.style.display = 'none';

				if(data.editor_type == 'advanced') {
					document.getElementById('ziggeo-wall-parameters-adv').style.display = 'none';
				}
				else {
					document.getElementById('ziggeo-wall-parameters-easy').style.display = 'none';
				}
			}
		}
	});

	//Hook to remove the videowall warning
	ZiggeoWP.hooks.set('dashboard_templates_editing', 'videowallsz-template-editing', function() {
		var wallInfo = document.getElementById('ziggeo_videowall_info');
		wallInfo.style.display = 'none';
	});


	//Hook to fire when the advanced parameters are hidden and simple are shown
	ZiggeoWP.hooks.set('dashboard_template_editor_simple_shown', 'videowallsz-template-editing', function(data) {
		document.getElementById('ziggeo-wall-parameters-adv').style.display = 'none';

		var wall_params = document.getElementById('ziggeo-wall-parameters-easy');

		if(data.template_base == '[ziggeovideowall') {
			wall_params.style.display = 'block';
		}
		else {
			wall_params.style.display = 'none';
		}
	});

	//The advanced parameters are about to be shown
	ZiggeoWP.hooks.set('dashboard_template_editor_advanced_shown', 'videowallsz-template-editing', function(data) {
		document.getElementById('ziggeo-wall-parameters-easy').style.display = 'none';

		var wall_params = document.getElementById('ziggeo-wall-parameters-adv');

		if(data.template_base == '[ziggeovideowall') {
			wall_params.style.display = 'block';
		}
		else {
			wall_params.style.display = 'none';
		}
	});
}
