//JS code to handle videowalls on client side


// Index
//*******
//	1. Events
//		* DOM ready
//	2. General functionality
//		* videowallszUIVideoWallShow()
//		* videowallszUIVideoWallNoVideos()
//		* videowallszUISetupAutoplay()
//		* videowallszCreateWall()
//		* videowallszGetDateFromUnix()
//		* videowallszGetOrientation()
//		* videowallszUIPAutorefresh()
//	3. Filtering
//		* videowallszFilterApproved()
//		* videowallszFilterRejected()
//		* videowallszFilterPending()
//	4. Endless Walls
//		* videowallszUIVideoWallEndlessAddVideos()
//		* videowallszUIVideoWallEndlessOnScroll()
//		* videowallszUIVideoWallEndlessOnScrollUnsubscribe
//		> Chessboard Grid Walls
//		* videowallszUIAddVideoToChessboardGrid()
//		* videowallszUIPChessBoardGridPlayerBig()
//		* videowallszUIPChessBoardGridPlayerSmall()
//		* videowallszUIPChessBoardGridVideoAdd()
//		* videowallszUIChessBoardGridRandomField()
//		> Mosaic Grid Walls
//		* videowallszUIAddVideoToMosaicGrid()
//	5. "Static" Walls
//		* videowallszUIVideoWallPagedAddVideos()
//		* videowallszUIVideoWallPagedShowPage()
//	6. VideoSite Playlist Walls
//		* videowallszUIVideoSitePlaylistCreate()
//		* videowallszUIVideositePlaylistSidePopulate()
//		* videowallszUIVideositePlaylistDetailsCreate()
//		* videowallsUIVideositePlaylistGoTo()
//		* videowallsUIVideositePlaylistCreatePlayer()
//  7. Stripes Design (endless)
//	8. Polyfill
//		* .matches
//		* .closest


/////////////////////////////////////////////////
// 1. EVENTS
/////////////////////////////////////////////////

	//This is to make sure that the walls is added to the ZiggeoWP object. Needed until the core plugin no longer has the videowall codes.
	//When the system is loaded
	jQuery(document).ready( function() {
		//Sanity check - we do need the core Ziggeo plugin to be active
		if(typeof ZiggeoWP === 'undefined') {
			return false;
		}

		if(typeof ZiggeoWP.videowalls === 'undefined') {
			ZiggeoWP.videowalls = {
				//the array to hold all videowall
				//under each videowall data would be loaded_data for specific wall since each can have different data
				walls: [],
				endless: ''
			};
		}

		//Hook to help us set up the class for video wall. This is only done when wall is built first time
		ZiggeoWP.hooks.set('videowallsz_fresh_wall', 'videowallszUIHandleFreshWall',
			function(data) {
				var wall_class = 'ziggeo-wall';

				switch(ZiggeoWP.videowalls.walls[data.wall_id].indexing.design) {
					case 'show_pages': {
						wall_class += '-showPages';
						break;
					}
					case 'slide_wall': {
						wall_class += '-slideWall';

						break;
					}
					case 'chessboard_grid': {
						wall_class += '-chessboardGrid';

						break;
					}
					case 'mosaic_grid': {
						wall_class += '-mosaicGrid';
						break;
					}
					case 'videosite_playlist': {
						wall_class += '-VideoSitePlaylist';
						break;
					}
				}

				data.wall_element.className = "ziggeo_videoWall " + wall_class;

				if(ZiggeoWP.videowalls.walls[data.wall_id].indexing.auto_refresh > 0) {
					videowallszUIPAutorefresh(data.wall_id, true);
				}
			}
		);

		//Setup the autoplay on autoplay enabled videowalls
		ZiggeoWP.hooks.set('videowallsz_wall_request_made', 'videowallsUIHandleAutoplaySetup', 
			function(data) {
				if(ZiggeoWP.videowalls.autoplay_set) {
					return false;
				}

				//Autoplay is something we set up on a global plan, and we only really need to do it once.
				videowallszUISetupAutoplay(data);
				ZiggeoWP.videowalls.autoplay_set = true; //We only set it once, so we should know that we did.
			}
		);

		//Handle the show_pages and slide_wall videowall (paged videowalls)
		ZiggeoWP.hooks.set('videowallsz_wall_index_data_start', 'videowallsUIParsePagedWalls',
			function(data) {
				var current_wall = ZiggeoWP.videowalls.walls[data.wall_id];

				if(data.data.length === 0) {
					return false;
				}

				if(current_wall.indexing.design == 'show_pages' || current_wall.indexing.design == 'slide_wall') {

					//HTML output buffer
					var html = '';

					//set the video wall title
					html += current_wall.title;

					videowallszUIVideoWallPagedAddVideos(data.wall_element, data.wall_id, html, data.data);
				}
			}
		);

		//Handle chessboard_grid and mosaic_wall (endless videowalls)
		ZiggeoWP.hooks.set('videowallsz_wall_index_data_start', 'videowallsUIParseEndlessWalls',
			function(data) {
				if(data.data.length === 0) {
					return false;
				}

				var current_wall = ZiggeoWP.videowalls.walls[data.wall_id];

				// We want to stop this from running here if it is non-endless wall, or if it is endless wall
				// that does not activate the data load through scroll
				if(current_wall.indexing.design === 'show_pages' ||
				   current_wall.indexing.design === 'slide_wall' ||
				   current_wall.indexing.design === 'videosite_playlist' ||
				   current_wall.indexing.design === 'stripes') {
					return false;
				}

				//lets attach the event listener..
				if(!ZiggeoWP.videowalls.onscroll_set) {
					//We should do this only once
					window.addEventListener( 'scroll',  videowallszUIVideoWallEndlessOnScroll, false );
				}

				if( current_wall['continueFrom'] ) {
					current_wall['continueFrom'] += data.data.length;
				}
				else {
					current_wall['continueFrom'] = data.data.length;
				}

				ZiggeoWP.videowalls.onscroll_set = true;

				if(data.status === 'refreshing wall') {
					//new_data: new_data,
					videowallszUIVideoWallEndlessAddVideos(data.wall_element, data.wall_id, data.new_data, false);
				}
				else {
					videowallszUIVideoWallEndlessAddVideos(data.wall_element, data.wall_id, data.data, true);
				}
			}
		);

		//Parse the videos for the videosite_playlist videowall
		ZiggeoWP.hooks.set('videowallsz_wall_index_data_start', 'videowallsUIParseVideositePlaylist',
			function(data) {
				if(data.data.length === 0) {
					return false;
				}

				var current_wall = ZiggeoWP.videowalls.walls[data.wall_id];

				if(current_wall.indexing.design === 'videosite_playlist') {
					if(data.status === 'refreshing wall') {
						videowallszUIVideoSitePlaylistCreate(data.wall_element, data.wall_id, data.data, true);
					}
					else {
						videowallszUIVideoSitePlaylistCreate(data.wall_element, data.wall_id, data.data, false);
					}
				}
			}
		);

		// Handler for the stripes videowall design
		ZiggeoWP.hooks.set('videowallsz_wall_index_data_start', 'videowallsUIParseStripesVideos',
			function(data) {
				if(data.data.length === 0) {
					return false;
				}

				var current_wall = ZiggeoWP.videowalls.walls[data.wall_id];

				if(current_wall.indexing.design === 'stripes') {
					//if(data.status === 'refreshing wall') {
					//	videowallszUIVideoSitePlaylistCreate(data.wall_element, data.wall_id, data.data, true);
					//}
					//else {
						videowallsUIStripesCreateUI(data.wall_element, data.wall_id, data.data);
					//}
				}
			}
		);

		//Handler for when there are no videos
		ZiggeoWP.hooks.set('videowallsz_wall_index_data_start', 'videowallsUIParseNoVideos',
			function(data) {
				if(data.data.length > 0) {
					return false;
				}

				var current_wall = ZiggeoWP.videowalls.walls[data.wall_id];

				if(current_wall.indexing.fresh === false) {
					//We had some videos already..
					var tmp = document.getElementById('ziggeo-endless-loading_more');

					if(tmp) {
						tmp.innerHTML = "No more videos..";
					}
				}
				else {
					//This is the first request
					//follow the procedure for no videos (on no videos)
					ziggeoDevReport('No videos found matching the requested: ' + JSON.stringify(data.search_parameters));

					//Lets process no videos which will return false or built HTML code.
					var html = videowallszUIVideoWallNoVideos(data.wall_id, current_wall.title);
				}

				//cancel the scrolling event when we have no more videos to load..
				if(ZiggeoWP.videowalls.endless === data.wall_id) {
					ZiggeoWP.videowalls.endless = null;
				}

				//function returns false if it should break out from the possition call was made.
				if(html === false) { return false; }

				if(current_wall.indexing.fresh === true) {
					data.wall_element.innerHTML = html;
				}
			}, 0
		);

		//Setting the orientation info
		ZiggeoWP.hooks.set('videowallsz_wall_index_data_start', 'videowallsUIPOrinetationSet',
			function(data) {
				if(data.data.length === 0) {
					return false;
				}

				var i, l;

				for(i = 0, l = data.data.length; i < l; i++) {
					var current = data.data[i];

					var _orientation = videowallszGetOrientation(current);

					if( typeof current.wordpress === 'undefined') {
						data.data[i].wordpress = {
							'orientation': ''
						};
					}

					data.data[i].wordpress.orientation = _orientation;
				}
			}, 1
		);

		//Save the latest video that we got
		ZiggeoWP.hooks.set('videowallsz_wall_index_data_start', 'videowallsUIPFreshestVideo',
			function(data) {
				if(!ZiggeoWP.videowalls.walls[data.wall_id].indexing.last_video) {
					ZiggeoWP.videowalls.walls[data.wall_id].indexing.last_video = null;
				}

				if(data.data.length === 0) {
					return false;
				}

				ZiggeoWP.videowalls.walls[data.wall_id].indexing.last_video = data.data[0];
			}, 1
		);


		/*
		//The following are two examples how you can change the template of the video player when videos are not found
		// as well as to change the message that is shown
		ZiggeoWP.hooks.set('videowallsz_no_videos_template', 'videowallsNoVideosTemplate', function(info) {
			info.templateName = 'ziggeo-parameter="some value"';
		});
		ZiggeoWP.hooks.set('videowallsz_no_videos_message', 'videowallsNoVideosTemplate', function(info) {
			info.message = 'This is an example how your hook can change the text'
		});
		*/

		/*
		//Example how you could change the template for the player
		ZiggeoWP.hooks.set('videowallsz_wall_video_add', 'videowallsEndlessWallVideoTemplate', function(codes) {
			codes.player = 'ziggeo-theme="red"';
		});
		*/

		ZiggeoWP.hooks.set('videowallsz_wall_switching_page', 'videowallsUIPPauseVideos', function(data) {
			if(ZiggeoWP.videowalls.walls[data.wall_id].current_player) {
				ZiggeoWP.videowalls.walls[data.wall_id].current_player.pause();
			}
		});

		// Sets the videosite_playlist to be mobile friendly
		// With delay to support various lazy load options

		// on immediate load
		videowallsUIVideositePlaylistMobile();

		// after 2 seconds
		setTimeout(videowallsUIVideositePlaylistMobile, 2000);

		// after 5 seconds
		setTimeout(videowallsUIVideositePlaylistMobile, 5000);

		// after 10 seconds
		setTimeout(videowallsUIVideositePlaylistMobile, 10000);
	});




/////////////////////////////////////////////////
// 2. GENERAL FUNCTIONALITY
/////////////////////////////////////////////////

	function videowallszAPISuccess(data, wall_id, wall_reference, search_params, is_csv) {

		if(is_csv === true) {
			data = data.split(',');
		}
		else {
			//We first check if we have any videos matching the requirements of the wall
			if(ZiggeoWP.videowalls.walls[wall_id].indexing.status === 'approved') {
				data = videowallszFilterApproved(data);
			}
			else if(ZiggeoWP.videowalls.walls[wall_id].indexing.status === 'rejected') {
				data = videowallszFilterRejected(data);
			}
			else if(ZiggeoWP.videowalls.walls[wall_id].indexing.status === 'pending') {
				data = videowallszFilterPending(data);
			}
			//Else it is all and we do not need to filter anything (status: "all")
		}

		//Now raising the notification about the video data being ready
		ZiggeoWP.hooks.fire('videowallsz_wall_index_data_start', {
			wall_id: wall_id,
			wall_element: wall_reference,
			search_parameters: search_params,
			data: data,
			status: 'about_to_process_data'
		});

		//The videowall is no longer fresh, so all initial actions should no longer be caried out..
		ZiggeoWP.videowalls.walls[wall_id].indexing.fresh = false;

		//We are currently not processing any videos (in video wall context)
		ZiggeoWP.videowalls.walls[wall_id].processing = false;

		wall_reference.style.display = 'block';

		ZiggeoWP.hooks.fire('videowallsz_wall_index_data_finished', {
			wall_id: wall_id,
			wall_element: wall_reference,
			search_parameters: search_params,
			data: data,
			status: 'videowall_is_processed'
		});
	}

	//in case there are multiple walls on the same page, we want to be sure not to cause issues.
	// This should catch it and not declare the function again.
	//show video wall based on its ID
	function videowallszUIVideoWallShow(id, search_params) {

		// support for lazy load
		if(typeof ziggeo_app === 'undefined') {
			setTimeout(function() {
				videowallszUIVideoWallShow(id, search_params);
			}, 200);
			return false;
		}

		if(typeof search_params === "undefined" || search_params === null || typeof(search_params) != "object") {
			search_params = {};
		}

		var search_obj = {
			limit: (search_params.limit) ? search_params.limit : Math.max(50, ZiggeoWP.videowalls.walls[id].indexing.perPage),
			tags: (ZiggeoWP.videowalls.walls[id].tags) ? ZiggeoWP.videowalls.walls[id].tags : "",
			skip: (search_params.skip) ? search_params.skip : 0,
		}

		// Only include the status if someone set it up
		if(ZiggeoWP.videowalls.walls[id].indexing.status !== '' &&
		   ZiggeoWP.videowalls.walls[id].indexing.status !== 'all') {
			search_obj.approved = ZiggeoWP.videowalls.walls[id].indexing.status; 
		}

		//reference to wall
		var wall = document.getElementById(id);

		//For the cases when you want to add some JS only if a videowall is being made.
		ZiggeoWP.hooks.fire('videowallsz_wall_request_made', {
			wall_id: id,
			wall_element: wall,
			search_parameters: search_params,
			status: 'wall_might_be_created'
		});

		//lets check if wall is existing or not. If not, we break out and report it.
		if(!wall) {
			ziggeoDevReport('Exiting function. Specified wall is not present');

			ZiggeoWP.hooks.fire('videowallsz_wall_not_found', {
				wall_id: id,
				wall_element: wall,
				search_parameters: search_params,
				status: 'no_wall_element_found'
			});

			return false;
		}

		if(!ZiggeoWP.videowalls.walls[id]) {
			ziggeoDevReport('Incorrect wall reference.');

			ZiggeoWP.hooks.fire('videowallsz_wall_invalid_reference', {
				wall_id: id,
				wall_element: wall,
				search_parameters: search_params,
				status: 'no_wall_data_found'
			});

			return false;
		}

		// Let's check if this is the pre-defined list of videos or if we should use our API
		if(ZiggeoWP.videowalls.walls[id].indexing.pre_set_list.trim().length > 0) {
			// We should have a comma separated list here

			videowallszAPISuccess(ZiggeoWP.videowalls.walls[id].indexing.pre_set_list, id, wall, search_params, true);
			return true;
		}

		if(ZiggeoWP.videowalls.walls[id].indexing.fresh === true) {
			//a fresh wall
			ZiggeoWP.hooks.fire('videowallsz_fresh_wall', {
				wall_id: id,
				wall_element: wall,
				search_parameters: search_params,
				status: 'first_time_build'
			});
		}

		//To show the page we must first index videos..
		//We are making it get 100 videos data per call
		var _index = ziggeo_app.videos.index( search_obj );

		_index.success( function (data) {
			videowallszAPISuccess(data, id, wall, search_params);
		});

		_index.error(function (args, error) {
			ziggeoDevReport('This was the error that we got back when searching for ' + JSON.stringify(args) +  ':' + error, 'error');

			ZiggeoWP.hooks.fire('videowallsz_wall_index_error', {
				wall_id: id,
				wall_element: wall,
				search_parameters: search_params,
				status: 'index_error_happened'
			});
		});
	}

	//handler for the cases when either no videos are found or videos found do not match the status requested
	// (not to be mistaken with 'video status').
	function videowallszUIVideoWallNoVideos(id, html) {

		var current_wall = ZiggeoWP.videowalls.walls[id];

		//Is the vall set up to be hidden when there are no videos?
		if(current_wall.onNoVideos.hideWall) {
			//Lets still leave a note about it in console.
			ziggeoDevReport('VideoWall is hidden');
			return false;
		}

		//adding page - has additional (empty) class to allow nicer styling
		html += '<div id="' + id + '_page_1' + '" class="ziggeo_wallpage empty">';
		var info = current_wall.onNoVideos;

		//Should we show some template?
		if(current_wall.onNoVideos.showTemplate) {

			ZiggeoWP.hooks.fire('videowallsz_no_videos_template', info);

			html += '<ziggeoplayer ' + info.templateName + '></ziggeoplayer>';
		}
		else { //or a message instead?
			ZiggeoWP.hooks.fire('videowallsz_no_videos_message', info);

			html += current_wall.onNoVideos.message;
		}
		//closing the page.
		html += '</div>';

		return html; //return the code we built..
	}

	//Sets up the events so that we can handle the autoplay in videowalls by utilizing app wide embedding events
	//It does not create the wall, so it does not depend on a specific videowall
	function videowallszUISetupAutoplay(data) {

		//We need to make sure that autoplay either:
		//1. always goes from one played video to the next regardless if some video is played manually
		//2. continue playing only from the video that was last played
		//3. should check right at start if the autoplay is even allowed there..
		//* otherwise you would be starting an autoplay of next video every time you click to play one


		//Lets see when the video stops playing
		ziggeo_app.embed_events.on('ended', function (embedding) {

			//current player
			var current_player_ref = embedding.element()[0].parentElement;

			//current wall that player is part of
			var current_wall_ref = current_player_ref.closest(".ziggeo_videoWall");

			//If we are not part of the videowall we just exit
			if(current_wall_ref === null || typeof current_wall_ref === 'undefined') {
				return false;
			}

			//If the video ID does not exist for some reason or the autoplay is turned off, exit
			if(!ZiggeoWP.videowalls.walls[current_wall_ref.id] ||
				ZiggeoWP.videowalls.walls[current_wall_ref.id].videos.autoplay !== true) {
				return false;
			}

			//Get the current wall reference
			var current_wall = ZiggeoWP.videowalls.walls[current_wall_ref.id];

			//Sanity check - is this the player from which we should continue
			if(ZiggeoWP.videowalls.walls[current_wall_ref.id].current_player &&
				ZiggeoWP.videowalls.walls[current_wall_ref.id].current_player !== embedding) {
				return false;
			}

			//Find next video player
			//There are different designs. Each design requires different approach.
			var next_player = null;

			//This will work for 'Mosaic Grid' and 'Chessboard Grid' designs as well as for videos on same page on 'Show Pages' design
			if(current_player_ref.nextElementSibling &&
				current_player_ref.nextElementSibling.tagName === 'ZIGGEOPLAYER') {

				next_player = ZiggeoApi.V2.Player.findByElement( current_player_ref.nextElementSibling );
				next_player.play();
				return true;

			}
			else {

				if(current_wall.indexing.design === 'show_pages' ) {
					if(current_player_ref.parentElement.id.indexOf('_page_') > -1) {

						var _num = ((current_player_ref.parentElement.id.replace(current_wall_ref.id + '_page_', '') *1) + 1);

						if(document.getElementById(current_wall_ref.id + '_page_' + _num)) {
							//Switch the page
							videowallszUIVideoWallPagedShowPage(current_wall_ref.id, _num);

							//find and play the video
							next_player = ZiggeoApi.V2.Player.findByElement(current_player_ref.parentElement.nextElementSibling.children[0]);
							next_player.play();
							return true;
						}
						else {
							if(current_wall.videos.autoplaytype === 'continue-run') {
								//Go back to first page
								videowallszUIVideoWallPagedShowPage(current_wall_ref.id, 1);

								//Find and play the video
								next_player = ZiggeoApi.V2.Player.findByElement(document.getElementById( current_wall_ref.id + '_page_1').children[0]);
								next_player.play();
								return true;
							}
						}

					}
				}
				else if(current_wall.indexing.design === 'slide_wall') {
					if(current_player_ref.parentElement.nextElementSibling) {
						current_player_ref.parentElement.nextElementSibling.style.display = 'block';
						current_player_ref.parentElement.style.display = 'none';

						var _next = current_player_ref.parentElement.nextElementSibling.children;

						if(_next[0] && _next[0].tagName === 'ZIGGEOPLAYER') {
							_next = _next[0];
						}
						else if(_next[1] && _next[1].tagName === 'ZIGGEOPLAYER') {
							_next = _next[1];
						}
						else {
							return false;
						}

						next_player = ZiggeoApi.V2.Player.findByElement(_next);
						next_player.play();
						return true;
					}
					else {
						if(current_wall.videos.autoplaytype === 'continue-run') {

							document.getElementById(current_wall_ref.id + '_page_1').style.display = 'block';
							current_player_ref.parentElement.style.display = 'none';

							var _next = document.getElementById(current_wall_ref.id + '_page_1').children;

							if(_next[0] && _next[0].tagName === 'ZIGGEOPLAYER') {
								_next = _next[0];
							}
							else if(_next[1] && _next[1].tagName === 'ZIGGEOPLAYER') {
								_next = _next[1];
							}
							else {
								return false;
							}

							next_player = ZiggeoApi.V2.Player.findByElement(_next);
							next_player.play();
							return true;
						}
					}
				}
				else if(current_wall.indexing.design === 'mosaic_grid') {
					if(current_player_ref.parentElement.nextElementSibling) {
						next_player = ZiggeoApi.V2.Player.findByElement(current_player_ref.parentElement.nextElementSibling.children[0]);
						next_player.play();
						return true;
					}
					else {
						if(current_wall.videos.autoplaytype === 'continue-run') {
							next_player = ZiggeoApi.V2.Player.findByElement(current_wall_ref.getElementsByClassName('mosaic_col')[0].children[0]);
							next_player.play();
							return true;
						}
					}
				}
				else if(current_wall.indexing.design === 'chessboard_grid') {
					if(current_wall.videos.autoplaytype === 'continue-run') {
						next_player = ZiggeoApi.V2.Player.findByElement(current_player_ref.parentElement.children[0]);
						next_player.play();
						return true;
					}
				}
			}
		});

		ziggeo_app.embed_events.on('playing', function (embedding) {

			//current player
			var current_player_ref = embedding.element()[0].parentElement;

			//current wall that player is part of
			var current_wall_ref = current_player_ref.closest(".ziggeo_videoWall");

			//If we are not part of the videowall we just exit
			if(current_wall_ref === null || typeof current_wall_ref === 'undefined') {
				return false;
			}

			//If the video ID does not exist for some reason or the autoplay is turned off, exit
			//if(!ZiggeoWP.videowalls.walls[current_wall_ref.id] ||
			//	ZiggeoWP.videowalls.walls[current_wall_ref.id].videos.autoplay !== true) {
			//	return false;
			//}

			ZiggeoWP.videowalls.walls[current_wall_ref.id].current_player = embedding;
		});
	}

	function videowallszCreateWall(id, wall_object, counter) {

		//Sanity check - we do need the core Ziggeo plugin to be active
		if(typeof ZiggeoWP === 'undefined') {
			if(isNaN(counter)) {
				counter = 1;
			}

			if(counter >= 4) {
				return false;
			}

			setTimeout(function(){
				videowallszCreateWall(id, wall_object, counter++);
			}, 2000);
			return false;
		}

		if(typeof ZiggeoWP.videowalls === 'undefined') {
			ZiggeoWP.videowalls = {
				//the array to hold all videowall
				//under each videowall data would be loaded_data for specific wall since each can have different data
				walls: {},
				endless: ''
			};
		}
		else {
			//We add one by one in case it is not there
			if(typeof ZiggeoWP.videowalls.walls === 'undefined') {
				ZiggeoWP.videowalls.walls = {};
			}
			if(typeof ZiggeoWP.videowalls.endless === 'undefined') {
				ZiggeoWP.videowalls.endless = '';
			}
		}

		ZiggeoWP.videowalls.walls[id] = wall_object;
	}

	//Function helper to help us get the right format of time based on UNIX timestamp
	function videowallszGetDateFromUnix(unix_timestamp) {

		var _date = new Date(unix_timestamp * 1000);

		return _date.toDateString();
	}

	//Returns the right orientation info
	function videowallszGetOrientation(video_data) {

		var width = video_data.default_stream.video_width;
		var height = video_data.default_stream.video_height;

		//portrait
		if(height > width) {
			return 'portrait';
		}
		//landscape
		else {
			return 'landscape';
		}
	}

	function videowallszUIPAutorefresh(wall_id, initial) {

		var time = ZiggeoWP.videowalls.walls[wall_id].indexing.auto_refresh * 1000;

		if(initial === true) {
			//This is set up on very first call, so we will always allow it + 10 seconds to let other things load up freely.
			time += 10000;
		}

		// If the list is manually provided, we do not do any API calls
		if(ZiggeoWP.videowalls.walls[wall_id].indexing.pre_set_list.trim.length > 0) {
			return false;
		}

		//Sure we could use setInterval, however setTimeout is used because we want to make a new request only
		// after we get the response from the previous one. It makes no sense for us to send one each second
		// and we for example did not yet get a response.
		setTimeout(function() {
			var wall = ZiggeoWP.videowalls.walls[wall_id];

			var search_obj = {
				limit: 1,
				tags: (ZiggeoWP.videowalls.walls[wall_id].tags) ? ZiggeoWP.videowalls.walls[wall_id].tags : "",
				skip: 0,
				approved: ZiggeoWP.videowalls.walls[wall_id].status
			};

			var _index = ziggeo_app.videos.index( search_obj );
			var last_video = ZiggeoWP.videowalls.walls[wall_id].indexing.last_video.token;

			_index.success( function (data) {

				if(data.length > 0) {
					if(data[0].token == last_video) {
						//Same token, nothing to do..
						videowallszUIPAutorefresh(wall_id);
						return false;
					}
					else {
						//Not the same token, we should show this one
						//This will stop the current playback if active!
						// (if you use this setup, you likely want this to happen)

						//At this time we should request 10 more videos to see how many new videos are present
						//DEVS: If at some point you need more than 10, let us know, we could make it configurable
						// depending on popularity.

						search_obj.limit = 10;

						var _in_index = ziggeo_app.videos.index( search_obj );

						_in_index.success( function (data) {

							ZiggeoWP.videowalls.walls[wall_id].indexing.last_video = data[0];

							var new_data = [];
							var i, l;

							for(i = 0, l = data.length; i < l; i++) {
								if(data[i].token === last_video) {
									break;
								}
								new_data.push(data[i]);
							}

							if(ZiggeoWP.videowalls.walls[wall_id].indexing.status === 'approved') {
								new_data = videowallszFilterApproved(new_data);
							}
							else if(ZiggeoWP.videowalls.walls[wall_id].indexing.status === 'rejected') {
								new_data = videowallszFilterRejected(new_data);
							}
							else if(ZiggeoWP.videowalls.walls[wall_id].indexing.status === 'pending') {
								new_data = videowallszFilterPending(new_data);
							}

							if(typeof ZiggeoWP.videowalls.walls[wall_id].loaded_data !== 'undefined') {
								ZiggeoWP.videowalls.walls[wall_id].loaded_data = new_data.concat(ZiggeoWP.videowalls.walls[wall_id].loaded_data);
							}
							else {
								ZiggeoWP.videowalls.walls[wall_id].loaded_data = new_data;
							}

							ZiggeoWP.hooks.fire('videowallsz_wall_index_data_start', {
								wall_id: wall_id,
								wall_element: document.getElementById(wall_id),
								search_parameters: search_obj,
								data: ZiggeoWP.videowalls.walls[wall_id].loaded_data,
								new_data: new_data,
								status: 'refreshing wall'
							});

							videowallszUIPAutorefresh(wall_id);
						});
					}
				}
			});
		}, time);
	}




/////////////////////////////////////////////////
// 3. FILTERING
/////////////////////////////////////////////////

	//Goes through the list of videos and their data and then filters out the approved from the rest and returns
	// an array of only approved videos
	function videowallszFilterApproved(videos) {

		var _filtered = [];

		for(i = 0, j = videos.length; i < j; i++) {
			if(videos[i].approved === true) {
				_filtered.push(videos[i]);
			}
		}

		return _filtered;
	}

	//Goes through the list of videos and their data and then filters out the rejected videos from the rest and returns
	// an array of only rejected videos
	function videowallszFilterRejected(videos) {

		var _filtered = [];

		for(i = 0, j = videos.length; i < j; i++) {
			if(videos[i].approved === false) {
				_filtered.push(videos[i]);
			}
		}

		return _filtered;
	}

	//Goes through the list of videos and their data and then filters out all videos that were not yet moderated
	// pending (to be moderated) and returns array of just such videos
	function videowallszFilterPending(videos) {

		var _filtered = [];

		for(i = 0, j = videos.length; i < j; i++) {
			if(videos[i].approved === null || videos[i].approved === '') {
				_filtered.push(videos[i]);
			}
		}

		return _filtered;
	}




/////////////////////////////////////////////////
// 4. ENDLESS WALLS
/////////////////////////////////////////////////

	// function to handle the video walls without the pagination, having the endless scroll implementation base..
	function videowallszUIVideoWallEndlessAddVideos(wall, id, wall_data, _new) {

		//Chessboard grid
		if(ZiggeoWP.videowalls.walls[id].indexing.design === 'chessboard_grid') {
			return videowallszUIAddVideoToChessboardGrid(wall, id, wall_data, _new);
		}
		else {
			//Mosaic grid codes..
			//if(ZiggeoWP.videowalls.walls[id].indexing.design === 'mosaic_grid') {
			return videowallszUIAddVideoToMosaicGrid(wall, id, wall_data, _new);
		}
	}

	//handler for the scroll event, so that we can do our stuff for the endless scroll templates
	function videowallszUIVideoWallEndlessOnScroll() {

		var wall = null;

		//get reference to the wall..
		if( ZiggeoWP && ZiggeoWP.videowalls.walls && ZiggeoWP.videowalls.endless &&
			(wall = document.getElementById(ZiggeoWP.videowalls.endless)) ) {
			//all good
			var id = ZiggeoWP.videowalls.endless;

			// Make sure it is not chessboard grid as it has different ways of adding videos
			if(ZiggeoWP.videowalls.walls[id].indexing.design === 'chessboard_grid') {
				videowallszUIVideoWallEndlessOnScrollUnsubscribe();
				return false;
			}
		}
		else {
			//OK so there is obviously no wall. Instead of recreating the same check each time, lets clean up..
			videowallszUIVideoWallEndlessOnScrollUnsubscribe();
			return false;
		}

		//lets go out if we are already processing the same request and scroll happened again..
		if(ZiggeoWP.videowalls.walls[id].processing === true) {
			return false;
		}

		//lets check the position of the bottom of the video wall from the top of the screen and then, if the same is equal to or lower than 80% of our video wall, we need to do some new things
		if(wall.getBoundingClientRect().bottom <= ( wall.getBoundingClientRect().height * 0.20 )) {
			//lets lock the indexing to not be called more than once for same scroll action..
			ZiggeoWP.videowalls.walls[id].processing = true;

			if(ZiggeoWP.videowalls.walls[id]['loaded_data']) {
				//do we have more data than we need to show? if we do, lets show it right away, if not, we should load more data and show what we have as well..
				if(ZiggeoWP.videowalls.walls[id]['loaded_data'].length > ZiggeoWP.videowalls.walls[id].indexing.perPage) {
					//we use the data we already got from our servers
					videowallszUIVideoWallEndlessAddVideos(wall, id, ZiggeoWP.videowalls.walls[id]['loaded_data']);
					ZiggeoWP.videowalls.walls[id].processing = false;
				}
				else {
					//we are using any data that we already have and create a call to grab new ones as well.
					videowallszUIVideoWallEndlessAddVideos(wall, id, ZiggeoWP.videowalls.walls[id]['loaded_data']);
					videowallszUIVideoWallShow(id, { skip: ZiggeoWP.videowalls.walls[id]['continueFrom'] });
				}
			}
		}
	}

	// Function that helps us to no longer listen to the scroll event
	function videowallszUIVideoWallEndlessOnScrollUnsubscribe() {
		(document.removeEventListener) ? (
			window.removeEventListener( 'scroll',  videowallszUIVideoWallEndlessOnScroll ) ) : (
			window.detachEvent( 'onscroll', videowallszUIVideoWallEndlessOnScroll) );
	}


	// Chessboard Grid
	////////////////////

	// This function is used to add videos to your videowall with a Chessboard Grid design.
	// Like Chessboard this is designed to be 8 x 8 grid which means 64 videos per board. All videos will 
	function videowallszUIAddVideoToChessboardGrid(wall, id, wall_data, _new) {

		// Board Parameters:
		// 8x8 board
		// 2x8 row on one side (top)
		// 2x8 row on one side (bottom)
		// Total of 2 players (black and white) total of 16+16 chess pieces

		// Let's mark this wall as our current endless wall
		ZiggeoWP.videowalls.endless = id;

		var i, j, c;
		var is_csv = (typeof wall_data[0] !== 'undefined' && typeof wall_data[0].token !== undefined) ? false: true;

		if(is_csv === true) {
			ziggeoDevReport('Custom tokens are not currently supported in ChessBoard Grid video wall');
			return false;
		}

		// Let us show loading indicator as we load the videos
		var tmp = document.getElementById('ziggeo-endless-loading_more');

		if(tmp) {
			tmp.parentNode.removeChild(tmp);
		}
		else {
			var loading_elm = document.createElement('div');
			loading_elm.id = "ziggeo-endless-loading_more";

			var info = {
				element_ref: loading_elm,
				text:"Loading More Videos.."
			};

			//Allows you to change the text if you wanted, or use the referene to element to apply class, etc.
			ZiggeoWP.hooks.fire('videowallsz_wall_loading_more_text', info);

			loading_elm.innerHTML = info.text;

			wall.parentNode.appendChild(loading_elm, wall);
		}

		var used_videos = 0;

		// We need to do this first. If we leave it hidden, then the width is 0, so we end up with 0/8-4 and -4 does not look good
		wall.style.display = 'block';
		var _width = (wall.getBoundingClientRect().width / 8) - 4;

		// The width of single row.
		_width = Math.round(_width);
		_height = _width;

		var player_code = '';

		// Prepare the player template we will use
		player_code += ' ziggeo-width="100%"';
		//+
		//				( (used_videos === 0 && ZiggeoWP.videowalls.walls[id].videos.autoplay &&
		//				ZiggeoWP.videowalls.walls[id].indexing.fresh === true) ? ' ziggeo-autoplay ' : '' );


		//in case we need to add the class to it
		if(ZiggeoWP.videowalls.walls[id].videos.autoplaytype !== "" &&
			ZiggeoWP.videowalls.walls[id].videos.autoplaytype !== false) {
			player_code += ' class="ziggeo-autoplay-' +
				( ( ZiggeoWP.videowalls.walls[id].videos.autoplaytype === 'continue-end' ) ? 'continue-end' : 'continue-run' ) +
				'"';
		}

		//Stretch * Note: This will be removed since it is removed (no longer needed) from JS SDK in r38
		if(ZiggeoWP.videowalls.walls[id].videos.stretch !== false &&
			ZiggeoWP.videowalls.walls[id].videos.stretch !== '') {
			if(ZiggeoWP.videowalls.walls[id].videos.stretch === 'both') {
				player_code += ' ziggeo-stretch';
			}
			if(ZiggeoWP.videowalls.walls[id].videos.stretch === 'by_height') {
				player_code += ' ziggeo-stretchheight';
			}
			if(ZiggeoWP.videowalls.walls[id].videos.stretch === 'by_width') {
				player_code += ' ziggeo-stretchwidth';
			}
		}

		ZiggeoWP.videowalls.walls[id].player_template_base = player_code;

		// Create grid

		var _current_row;
		var _alternate = false;

		// Fields should be of same width and height. To do that, we should listen to resizing event as well.
		for(i = 0, c = 64; i < c; i++) {

			if(i === 0 || i%8 == 0) {
				_current_row = document.createElement('div');
				_current_row.className = 'videowalls_chessboard_grid_row';
				wall.appendChild(_current_row);

				if(i%16 === 0) {
					_alternate = true;
				}
				else {
					_alternate = false;
				}
			}

			var _color = 'white_field';

			if(i%2 !== 0) {
				_color = 'black_field';
			}

			if(_alternate === true) {
				if(_color === 'white_field') {
					_color = 'black_field';
				}
				else {
					_color = 'white_field';
				}
			}

			var field = document.createElement('div');
			field.className = 'chessboard_field ' + _color; //((i%2 === 0) ? 'white_field' : 'black_field');
			field.id = 'videowallsz-chess-field-' + i;
			field.style.width = _width + 'px';
			field.style.height = _height + 'px';
			_current_row.appendChild(field);
		}

		// random first chess piece
		// This is always the second row
		var random_autoplay_piece = videowallszUIChessBoardGridRandomField() + 8;

		// Add chess pieces - white goes first
		for(i = 0, c = 16; i < c; i++) {

			if( i === 0 && wall_data.length < 16) {
				c = wall_data.length / 2;
			}

			var codes = {
				player: '',
				additional: ''
			};

			if(typeof wall_data[i].token === 'undefined') {

			}

			codes.player = player_code + ' ziggeo-video="' + wall_data[i].token + '"';

			if(i === random_autoplay_piece && ZiggeoWP.videowalls.walls[id].videos.autoplay === true) {
				codes.player += ' ziggeo-autoplay="true"';
			}

			//Set the orientation
			if(wall_data[i].wordpress) {
				codes.additional = ' data-orientation="' + wall_data[i].wordpress.orientation + '"';
			}


			//Two for a reason. First is global and true to all videowalls
			//Second is specific for the endless walls. Use one or the other.
			ZiggeoWP.hooks.fire('videowallsz_wall_video_add', codes);
			ZiggeoWP.hooks.fire('videowallsz_endlesswall_video_add', codes);

			//finalize the embedding
			var tmp_embedding = '<ziggeoplayer ' + codes.player  + codes.additional + '></ziggeoplayer>';

			//////////////

			// The placement of the video is very important part in chessboard grid..
			if(_new === true) {
				document.getElementById('videowallsz-chess-field-' + i).insertAdjacentHTML('afterbegin', tmp_embedding);
				//wall.insertAdjacentHTML('afterbegin', tmp_embedding);
			}
			else {
				// We do the random placement
				//wall.insertAdjacentHTML('beforeend', tmp_embedding);
			}
			used_videos++;
			wall_data[i] = null;//so that it is not used by other ifs..

			////////////////////
		}

		// Add chess pieces - black pieces go second (positioned at the bottom)
		for(i = 16, c = 32; i < c; i++) {

			if(i === 0 && wall_data.length < 16) {
				c = wall_data.length;
				i = wall_data.length / 2;
			}

			var codes = {
				player: '',
				additional: ''
			};

			codes.player = player_code + ' ziggeo-video="' + wall_data[i].token + '"';

			//Set the orientation
			if(wall_data[i].wordpress) {
				codes.additional = ' data-orientation="' + wall_data[i].wordpress.orientation + '"';
			}


			//Two for a reason. First is global and true to all videowalls
			//Second is specific for the endless walls. Use one or the other.
			ZiggeoWP.hooks.fire('videowallsz_wall_video_add', codes);
			ZiggeoWP.hooks.fire('videowallsz_endlesswall_video_add', codes);

			//finalize the embedding
			var tmp_embedding = '<ziggeoplayer ' + codes.player  + codes.additional + '></ziggeoplayer>';

			//////////////

			// The placement of the video is very important part in chessboard grid..
			if(_new === true) {
				document.getElementById('videowallsz-chess-field-' + (48 + (i - 16))).insertAdjacentHTML('afterbegin', tmp_embedding);
			}
			else {
				// We do the random placement
				//wall.insertAdjacentHTML('beforeend', tmp_embedding);
			}
			used_videos++;
			wall_data[i] = null;//so that it is not used by other ifs..

			////////////////////
		}

		// At the end, we remove the used video data from the listing
		for(i = -1, j = wall_data.length; i < j; j--) {
			//break once we load enought of videos
			if(wall_data[j] === null) {
				wall_data.splice(j, 1);
			}
		}


		// These are the videos that were retrieved from server, yet never used, so we can use them as needed.
		if(wall_data.length > 0) {
			ZiggeoWP.videowalls.walls[id]['loaded_data'] = wall_data;
		}

		ziggeo_app.embed_events.on("playing", function (player) {
			videowallszUIPChessBoardGridPlayerBig(player);
		});

		ziggeo_app.embed_events.on("ended", function (player, healthy) {
			videowallszUIPChessBoardGridPlayerSmall(player);
		});
	}

	// Function that makes our player big once it starts to play.
	function videowallszUIPChessBoardGridPlayerBig(player) {
		var element = player.__activeElement;
		// Playing can fire multiple times, so just being safe..
		element.className = element.className.replace('videowalls_playing', '');
		// apply videowalls_playing class
		element.className += ' videowalls_playing';
	}

	// Function that makes our player go back to the grid (makes it small, then activates the add new functionality)
	function videowallszUIPChessBoardGridPlayerSmall(player) {
		var element = player.__activeElement;
		// remove videowalls_playing class
		element.className = element.className.replace('videowalls_playing', '');

		// Now make it get hidden
		element.className += 'videowalls_effect_hide';

		// Now we work on getting it removed and new video added
		setTimeout(function() {

			placeholder = element.parentElement;

			// Needed because of the error that sometimes could happen
			if(element.parentElement) {
				element.parentElement.removeChild(element);
			}

			// and now we introduce a new video
			videowallszUIPChessBoardGridVideoAdd(placeholder);
		}, 2000);
	}

	// Function that is responsible for adding new videos and their placement
	function videowallszUIPChessBoardGridVideoAdd(placeholder, video_data) {
		// get the wall ID
		var wall_id = placeholder.parentElement.parentElement.id;

		// We get back to this function, so if outside function calls it, the second argument would be null
		if(typeof video_data !== null && typeof video_data !== 'undefined') {

			var wall = document.getElementById(wall_id);
			var data = ZiggeoWP.videowalls.walls[wall_id]

			var _row, _field, new_row, new_field;
			var found = false;

			do {
				_row = videowallszUIChessBoardGridRandomField();
				_field = videowallszUIChessBoardGridRandomField();

				new_row = wall.getElementsByClassName('videowalls_chessboard_grid_row')[_row];

				new_field = new_row.children[_field];

				if(new_field.innerHTML === '') {
					found = true;
				}
			} while (found === false);

			var player_code = ZiggeoWP.videowalls.walls[wall_id].player_template_base;

			var codes = {
				player: '',
				additional: ''
			};

			codes.player = player_code + ' ziggeo-video="' + video_data.token + '"';

			//Set the orientation
			if(video_data.wordpress) {
				codes.additional = ' data-orientation="' + video_data.wordpress.orientation + '"';
			}


			//Two for a reason. First is global and true to all videowalls
			//Second is specific for the endless walls. Use one or the other.
			ZiggeoWP.hooks.fire('videowallsz_wall_video_add', codes);
			ZiggeoWP.hooks.fire('videowallsz_endlesswall_video_add', codes);

			//finalize the embedding
			var tmp_embedding = '<ziggeoplayer ' + codes.player  + codes.additional + '></ziggeoplayer>';

			new_field.insertAdjacentHTML('afterbegin', tmp_embedding);

			return;
		}

		// Do we have anything to add from cache?
		if(ZiggeoWP.videowalls.walls[wall_id]['loaded_data'] && ZiggeoWP.videowalls.walls[wall_id]['loaded_data'].length > 0) {
			var video_obj = ZiggeoWP.videowalls.walls[wall_id]['loaded_data'].shift();

			return videowallszUIPChessBoardGridVideoAdd(placeholder, video_obj);
		}
		else {
			// Get new videos

		}
	}

	// Function that helps us get the random field we should place our new video at.
	function videowallszUIChessBoardGridRandomField() {
		return Math.floor(Math.random() * (7 + 1))
	}


	// Mosaic Grid
	////////////////

	// Function that helps us add the video to the Mosaic Grid walls
	function videowallszUIAddVideoToMosaicGrid(wall, id, wall_data, _new) {

		var used_videos = 0;
		var j = wall_data.length;

		var is_csv = (typeof wall_data[0] !== 'undefined' && typeof wall_data[0].token !== undefined) ? false: true;

		if(is_csv === true) {
			ziggeoDevReport('Custom tokens are not currently supported in Mosaic Grid video wall');
			return false;
		}

		if(ZiggeoWP.videowalls.walls[id]['loaded_data'] && _new === true) {
			j -= ZiggeoWP.videowalls.walls[id]['loaded_data'].length;
		}

		if(!ZiggeoWP.videowalls.walls[id].indexing.max_row) {
			//variable holding the maximum number of videos that will be in the mosaic row
			var _mosaic_row_max = Math.floor(Math.random() * 3) + 2;

			var cols = wall.getElementsByClassName('mosaic_col');

			if(cols === undefined || cols.length == 0) {
				//This is already made, otherwise we need to do it now..
				for(_mi = 0; _mi < _mosaic_row_max; _mi++) {	
					var _m_col = document.createElement('div');
					_m_col.className = 'mosaic_col';
					wall.appendChild(_m_col);
				}
			}

			ZiggeoWP.videowalls.walls[id].indexing.max_row = _mosaic_row_max;

			//set the class on wall with the number of rows we have..
			wall.className += ' wall_' + _mosaic_row_max + '_' + (Math.floor(Math.random() * 4)+1) + '_cols';
		}
		else {
			var _mosaic_row_max = ZiggeoWP.videowalls.walls[id].indexing.max_row;
		}

		//variable holding the current video (position) in the current row
		var _mosaic_row_count = 0;
		var _mosaic_rows = wall.querySelectorAll('.mosaic_col');

		for(i = 0, tmp=''; i < j; i++, tmp='', _mosaic_row_count++) {

			var codes = {
				player: '',
				additional: ''
			};

			if(ZiggeoWP.videowalls.walls[id].indexing.design === 'mosaic_grid') {
				//See if we need to go to new row
				if(_mosaic_row_max === _mosaic_row_count) {
					_mosaic_row_count = 0;
				}

				codes.player += ' ziggeo-width="100%"';
			}
			else {
				codes.player += ' ziggeo-width=' + ZiggeoWP.videowalls.walls[id].videos.width +
								' ziggeo-height=' + ZiggeoWP.videowalls.walls[id].videos.height;
			}

			codes.player += ' ziggeo-video="' + wall_data[i].token + '"' +
							( (used_videos === 0 && ZiggeoWP.videowalls.walls[id].videos.autoplay &&
								ZiggeoWP.videowalls.walls[id].indexing.fresh === true) ? ' ziggeo-autoplay ' : '' );

			//in case we need to add the class to it
			if(ZiggeoWP.videowalls.walls[id].videos.autoplaytype !== "" &&
				ZiggeoWP.videowalls.walls[id].videos.autoplaytype !== false) {
				codes.player += ' class="ziggeo-autoplay-' +
					( ( ZiggeoWP.videowalls.walls[id].videos.autoplaytype === 'continue-end' ) ? 'continue-end' : 'continue-run' ) +
					'"';
			}

			//Set the orientation
			if(wall_data[i].wordpress) {
				codes.additional = ' data-orientation="' + wall_data[i].wordpress.orientation + '"';
			}

			//Stretch * Note: This will be removed since it is removed (no longer needed) from JS SDK in r38
			if(ZiggeoWP.videowalls.walls[id].videos.stretch !== false &&
				ZiggeoWP.videowalls.walls[id].videos.stretch !== '') {
				if(ZiggeoWP.videowalls.walls[id].videos.stretch === 'both') {
					codes.player += ' ziggeo-stretch';
				}
				if(ZiggeoWP.videowalls.walls[id].videos.stretch === 'by_height') {
					codes.player += ' ziggeo-stretchheight';
				}
				if(ZiggeoWP.videowalls.walls[id].videos.stretch === 'by_width') {
					codes.player += ' ziggeo-stretchwidth';
				}
			}

			//Two for a reason. First is global and true to all videowalls
			//Second is specific for the endless walls. Use one or the other.
			ZiggeoWP.hooks.fire('videowallsz_wall_video_add', codes);
			ZiggeoWP.hooks.fire('videowallsz_endlesswall_video_add', codes);

			//finalize the embedding
			var tmp_embedding = '<ziggeoplayer ' + codes.player  + codes.additional + '></ziggeoplayer>';

			//@ADD - sort option as bellow, this is just a quick test
			if(_new === false) {
				_mosaic_rows[_mosaic_row_count].insertAdjacentHTML('afterbegin', tmp_embedding);
			}
			else {
				_mosaic_rows[_mosaic_row_count].insertAdjacentHTML('beforeend', tmp_embedding);
			}
			//wall.children[_mosaic_row_count].insertAdjacentHTML('beforeend', tmp_embedding);
			used_videos++;
			wall_data[i] = null;//so that it is not used by other ifs..
		}

		var tmp = document.getElementById('ziggeo-endless-loading_more');

		if(tmp) {
			tmp.parentNode.removeChild(tmp);
		}
		else {
			var loading_elm = document.createElement('div');
			loading_elm.id = "ziggeo-endless-loading_more";

			var info = {
				element_ref: loading_elm,
				text:"Loading More Videos.."
			};

			//Allows you to change the text if you wanted, or use the referene to element to apply class, etc.
			ZiggeoWP.hooks.fire('videowallsz_wall_loading_more_text', info);

			loading_elm.innerHTML = info.text;

			wall.parentNode.appendChild(loading_elm, wall);
		}

		ZiggeoWP.videowalls.endless = id;

		for(i = -1, j = wall_data.length; i < j; j--) {
			//break once we load enought of videos
			if(wall_data[j] === null) {
				wall_data.splice(j, 1);
			}
		}

		// These are the videos that were retrieved from server, yet never used, so we can use them as needed.
		if(wall_data.length > 0) {
			ZiggeoWP.videowalls.walls[id]['loaded_data'] = wall_data;
		}
	}




/////////////////////////////////////////////////
// 5. "STATIC" WALLS
/////////////////////////////////////////////////

	// function to handle the video walls with the pagination
	function videowallszUIVideoWallPagedAddVideos(wall, id, html, wall_data) {

		//number of videos per page currently
		var currentVideosPageCount = 0;
		//total number of videos that will be shown
		var used_videos = 0;
		//What page are we on?
		var currentPage = 0;
		//did any videos match the checks while listing them - so that we do not place multiple pages since the count stays on 0
		var newPage = true;

		var codes = {
			player: ''
		};

		ZiggeoWP.videowalls.walls[id]['loaded_data'] = wall_data;

		for(i = 0, j = wall_data.length, tmp=''; i < j; i++, tmp='') {

			var _token = (typeof wall_data[i].token === 'undefined') ? wall_data[i] : wall_data[i].token;

			codes.player = ' ziggeo-width=' + ZiggeoWP.videowalls.walls[id].videos.width +
							' ziggeo-height=' + ZiggeoWP.videowalls.walls[id].videos.height +
							' ziggeo-video="' + _token + '"' +
							( (used_videos === 0 && ZiggeoWP.videowalls.walls[id].videos.autoplay) ? ' ziggeo-autoplay ' : '' );

			//in case we need to add the class to it
			if(ZiggeoWP.videowalls.walls[id].videos.autoplaytype !== "") {
				codes.player += ' class="ziggeo-autoplay-' +
					( ( ZiggeoWP.videowalls.walls[id].videos.autoplaytype === 'continue-end' ) ? 'continue-end' : 'continue-run' ) +
					'"';
			}

			//Stretch
			if(ZiggeoWP.videowalls.walls[id].videos.stretch !== false) {
				if(ZiggeoWP.videowalls.walls[id].videos.stretch === 'both') {
					codes.player += ' ziggeo-stretch';
				}
				if(ZiggeoWP.videowalls.walls[id].videos.stretch === 'by_height') {
					codes.player += ' ziggeo-stretchheight';
				}
				if(ZiggeoWP.videowalls.walls[id].videos.stretch === 'by_width') {
					codes.player += ' ziggeo-stretchwidth';
				}
			}

			//Set the orientation
			if(typeof wall_data[i].wordpress !== 'undefined') {
				codes.additional = ' data-orientation="' + wall_data[i].wordpress.orientation + '"';
			}

			//Two for a reason. First is global and true to all videowalls
			//Second is specific for the endless walls. Use one or the other.
			ZiggeoWP.hooks.fire('videowallsz_wall_video_add', codes);
			ZiggeoWP.hooks.fire('videowallsz_pagedwall_video_add', codes);

			//finalize the embedding
			var tmp_embedding = '<ziggeoplayer ' + codes.player + codes.additional + '></ziggeoplayer>';

			tmp += tmp_embedding;
			used_videos++;
			currentVideosPageCount++;
			//wall_data[i] = null;//so that it is not used by other ifs..

			//Do we need to create a new page?
			//We only create new page if there were any videos to add, otherwise if 1 video per page is set, we would end up with empty pages when videos are not added..
			if(currentVideosPageCount === 1 && newPage === true) {
				//we do
				currentPage++;

				//For slidewall we add next right away..
				if(ZiggeoWP.videowalls.walls[id].indexing.design == 'slide_wall') {
					if(currentPage > 1) {
						html += '<div class="ziggeo_videowall_slide_next"  onclick="videowallszUIVideoWallPagedShowPage(\'' + id + '\', ' + currentPage + ');"></div>';
						html += '</div>';
					}
				}

				html += '<div id="' + id + '_page_' + currentPage + '" class="ziggeo_wallpage" ';

				if(currentPage > 1) {
					html += ' style="display:none;" ';
				}

				html += '>';

				//For slidewall we add back right away as well
				if(ZiggeoWP.videowalls.walls[id].indexing.design == 'slide_wall') {
					if(currentPage > 1) {
						html += '<div class="ziggeo_videowall_slide_previous"  onclick="videowallszUIVideoWallPagedShowPage(\'' + id + '\', ' + (currentPage-1) + ');"></div>';
					}
				}

				html += tmp;
				tmp = '';
				newPage = false;
			}

			//combining the code if any
			if(tmp !== '') {
				html += tmp;
			}

			//Do we have enough of vidoes on this page and its time to create a new one?
			if(currentVideosPageCount === ZiggeoWP.videowalls.walls[id].indexing.perPage) {
				//Yup, we do
				if(ZiggeoWP.videowalls.walls[id].indexing.design == 'show_pages') {
					html += '</div>';
				}
				currentVideosPageCount = 0;
				newPage = true;
			}
		}

		//Sometimes we will have videos, however due to calling parameters the same might not be added.
		//At this time we would need to show the log in console about the same and show the on_no_videos message / setup
		if(used_videos === 0 && i > 0) {
			html = videowallszUIVideoWallNoVideos(id, html);

			//leaving a note of this
			ziggeoDevReport('You have videos, just not the ones matching your request');

			if(html === false) {
				return false;
			}
		}

		//In case last page has less videos than per page limit, we need to apply the closing tag
		if(currentVideosPageCount < ZiggeoWP.videowalls.walls[id].indexing.perPage && newPage === false) {
			html += '</div>';
		}

		//Lets add pages if showPages is set
		if(ZiggeoWP.videowalls.walls[id].indexing.design == 'show_pages') {
			for(i = 0; i < currentPage; i++) {
				html += '<div class="ziggeo_wallpage_number' + ((i===0) ? ' current' : '') + '" onclick="videowallszUIVideoWallPagedShowPage(\'' + id + '\', ' + (i+1) + ',this);">' + (i+1) + '</div>';
			}
			html += '<br class="clear" style="clear:both;">';
		}

		//Lets add everything so that it is shown..
		wall.innerHTML = html;

		//lets show it:
		wall.style.display = 'block';
	}

	//Shows the selected page and hides the rest of the specific video wall.
	function videowallszUIVideoWallPagedShowPage(id, page, current) {
		//reference to wall
		var wall = document.getElementById(id);

		//lets check if wall is existing or not. If not, we break out and report it.
		if(!wall) {
			ziggeoDevReport('Exiting function. Specified wall is not present');
			return false;
		}

		var page_id = id + '_page_' + page;

		var page_new = document.getElementById(page_id);

		//Get all pages under current wall
		var pages = wall.getElementsByClassName('ziggeo_wallpage');

		//Hide all of the pages
		for(i = 0, j = pages.length; i < j; i++) {
			pages[i].style.display = 'none';
		}

		//set the visual indicator of what page is selected
		var page_numbers = wall.getElementsByClassName('ziggeo_wallpage_number');

		if(current === null || typeof current === 'undefined') {
			current = wall.getElementsByClassName('ziggeo_wallpage_number')[page-1];
		}

		//This is only active if we show page numbers / page buttons
		if(current) {
			//reset style of the page number buttons
			for(i = 0, j = page_numbers.length; i < j; i++) {
				page_numbers[i].className = 'ziggeo_wallpage_number';
			}

			//adding .current class to the existing list of classes
			current.className = 'ziggeo_wallpage_number current';
		}

		page_new.style.display = 'block';

		ZiggeoWP.hooks.fire('videowallsz_wall_switching_page', {
			wall_id: id,
			new_page: page_new,
			page_id: page_id,
			status: 'Switching page'
		});
	}




/////////////////////////////////////////////////
// 6. VIDEOSITE PLAYLIST WALLLS
/////////////////////////////////////////////////

	function videowallszUIVideoSitePlaylistCreate(wall, id, wall_data) {

		//The ID for the video 
		ZiggeoWP.videowalls.walls[id].videos.current = 0;
		var _exists = false;
		var is_csv = false;

		var _list = [];

		for(i = 0, j = wall_data.length; i < j; i++) {
			//Create a list for main player

			// Support for the pre_set_list
			if(typeof wall_data[i].token === 'undefined') {
				_list.push(wall_data[i]);
				is_csv = true;
			}
			else {
				_list.push(wall_data[i].token);
			}
		}

		if(document.getElementById('videosite_playlist_m_' + id)) {
			var _main = document.getElementById('videosite_playlist_m_' + id);

			//Removing everything from it so we make it all a new
			_main.innerHTML = '';

			_exists = true;
		}
		else {
			ZiggeoWP.videowalls.walls[id]['loaded_data'] = wall_data;

			//Create main
			var _main = document.createElement('div');
			_main.id = 'videosite_playlist_m_' + id;
			_main.className = 'videosite_playlist_main';
		}

		var _playlist = document.createElement('div');
		_playlist.className = 'video_placeholder';

		_main.appendChild(_playlist);

		if(is_csv === true) {
			var get_request = ziggeo_app.videos.get(wall_data[0]);

			get_request.success(function (data) {

				wall_data[0] = data;

				_main.appendChild(videowallszUIVideositePlaylistDetailsCreate({
					title: wall_data[0].title,
					description: wall_data[0].description,
					created: videowallszGetDateFromUnix(wall_data[0].created),
					__complete: wall_data[0]
				}));
			});
		}
		else {
			_main.appendChild(videowallszUIVideositePlaylistDetailsCreate({
				title: wall_data[0].title,
				description: wall_data[0].description,
				created: videowallszGetDateFromUnix(wall_data[0].created),
				__complete: wall_data[0]
			}));
		}

		wall.appendChild(_main);

		videowallsUIVideositePlaylistCreatePlayer(id, _playlist, _list, false);

		//Create side
		videowallszUIVideositePlaylistSidePopulate(id, wall_data, wall, is_csv);

		//lets show it:
		wall.style.display = 'block';

		//Let us make the main and side of same height
		_side.style.height = _main.getBoundingClientRect().height + 'px';

		if(_exists === false) {
			window.addEventListener('resize', function() {
				_side.style.height = _main.getBoundingClientRect().height + 'px';
			});

			//Thank you Daniel: https://stackoverflow.com/a/39312522
			new ResizeObserver(function() {
				_side.style.height = _main.getBoundingClientRect().height + 'px';
			}).observe(_main)
		}
	}

	function videowallszUIVideositePlaylistSidePopulate(wall_id, wall_data, wall_ref, is_csv) {

		var _new = false;

		//Let us see if this is already created or not
		if(document.getElementById('videosite_playlist_s_' + wall_id)) {
			var _side = document.getElementById('videosite_playlist_s_' + wall_id);
			_side.innerHTML = '';
		}
		else {
			var _side = document.createElement('div');
			_side.id = 'videosite_playlist_s_' + wall_id;
			_side.className = 'videosite_playlist_side';
			_new = true;
		}

		for(i = 0, j = wall_data.length; i < j; i++) {
			if(is_csv === true) {
				var get_request = ziggeo_app.videos.get(wall_data[i]);

				get_request.success(function (data) {

					wall_data[i] = data;

					createSideEntry(i, wall_data[i]);
				});
			}
			else {
				createSideEntry(i, wall_data[i]);
			}
		}

		function createSideEntry(current_index, data) {
			var _list_div = document.createElement('div');
			_list_div.id = "videosite_playlist-v-" + current_index;

			if(current_index === 0) {
				_list_div.className = 'current';
			}

			var _img_div = document.createElement('div');
			_img_div.className = 'img';
			var _img = document.createElement('img');
			_img.src = 'https://' + data['embed_image_url'];
			_img_div.appendChild(_img);

			var _title = document.createElement('div');
			_title.innerHTML = data['title'];
			_title.className = 'video_title';

			var _time = document.createElement('div');
			//TODO: we could add here a check to see if it is over minute, etc.
			_time.innerHTML = data['duration'] + 's';
			_time.className = 'video_duration';

			//We can add here title, image and time
			_list_div.appendChild(_img_div);
			_list_div.appendChild(_title);
			_list_div.appendChild(_time);

			_side.appendChild(_list_div);

			var _main_ref = document.getElementById('videosite_playlist_m_' + wall_id);
			_main_ref = _main_ref.getElementsByClassName('video_placeholder')[0];

			_list_div.addEventListener('click', function(evnt) {
				//Play from this video
				var i, j;

				var _go_to = evnt.currentTarget.id.replace('videosite_playlist-v-', '');

				var _t_data = ZiggeoWP.videowalls.walls[wall_id].loaded_data.slice(_go_to);

				var _list = [];

				for(i = 0, j = _t_data.length; i < j; i++) {
					//Create a list for main player
					_list.push(_t_data[i].token);
				}

				videowallsUIVideositePlaylistCreatePlayer(wall_id, _main_ref, _list, true);
				videowallsUIVideositePlaylistGoTo(wall_id, _go_to);
			});
		}

		wall_ref.appendChild(_side);

		//return _side;
	}

	//function to create and update the details if same ID already exists
	function videowallszUIVideositePlaylistDetailsCreate(details) {

		var _details = null;

		if(document.getElementById('videowalls_videosite_details')) {
			_details = document.getElementById('videowalls_videosite_details');
		}
		else {
			_details = document.createElement('div');
			_details.id = 'videowalls_videosite_details';
		}

		//We need to clear everything that is there...
		_details.innerHTML = '';

		var _title = document.createElement('div');
		_title.className = 'videowalls_videosite_title';
		_title.innerHTML = details['title'];

		var _description = document.createElement('div');
		_description.className = 'videowalls_videosite_desc';
		_description.innerHTML = details['description'];

		var _created = document.createElement('div');
		_created.className = 'videowalls_videosite_created';
		_created.innerHTML = details['created'];

		_details.appendChild(_title);
		_details.appendChild(_created);
		_details.appendChild(_description);

		ZiggeoWP.hooks.fire('videowalls_videosite_playlist_create_details', { data: details.__complete, details_element: _details});

		//Needed to return the element where we added the details
		return _details;
	}


	function videowallsUIVideositePlaylistGoTo(wall_id, go_to_id) {

		var wall = ZiggeoWP.videowalls.walls[wall_id];
		var data = wall.loaded_data;

		ZiggeoWP.hooks.fire('videowalls_videosite_playlist_goto', data[go_to_id]);

		//Set the details
		videowallszUIVideositePlaylistDetailsCreate({
			title: data[go_to_id].title,
			description: data[go_to_id].description,
			created: videowallszGetDateFromUnix(data[go_to_id].created),
			__complete: data[go_to_id]
		})

		var _current_elm = document.querySelector('#' + wall_id + ' .videosite_playlist_side .current');
		//Just to be safe
		if(_current_elm) {
			_current_elm.className = '';
			_current_elm.style.display = 'none';
		}

		//At this point we should also see if we should hide any other number of "videos" in sidebar
		if(wall.videos.current !== go_to_id) {
			//Hide from current to go_to_id
			for(i = wall.videos.current; i < go_to_id; i++) {
				document.getElementById('videosite_playlist-v-' + i).style.display = 'none';
			}
		}

		document.getElementById('videosite_playlist-v-' + go_to_id).className = 'current';

		//Set the current video in playback
		ZiggeoWP.videowalls.walls[wall_id].videos.current++;
	}

	function videowallsUIVideositePlaylistCreatePlayer(wall_id, placeholder_ref, video_list, start) {

		//You can use this hook to set the video_list_player to the object you want to use for the player base
		ZiggeoWP.hooks.fire('videowalls_videosite_main_player_pre_create', null);

		var _attrs = {
			width: '100%',
			theme: 'modern',
			themecolor: 'red',
		};

		if(typeof ZiggeoWP.videowalls.video_list_player !== 'undefined') {
			_attrs = ZiggeoWP.videowalls.video_list_player;
		}

		//We now set the playlist property to our own playlist
		_attrs.playlist = video_list;

		//Allows us to force the playback (or at least to try it)
		if(start === true) {
			_attrs.autoplay = true;
		}

		var player = new ZiggeoApi.V2.Player({
			element: placeholder_ref,
			attrs: _attrs
		});

		var current_data = '';
		var i, l;

		for(i = 0, l = ZiggeoWP.videowalls.walls[wall_id].loaded_data.length; i < l; i++) {
			//ZiggeoWP.videowalls.walls[wall_id].loaded_data
			if(ZiggeoWP.videowalls.walls[wall_id].loaded_data[i].token === video_list[0]) {
				current_data = ZiggeoWP.videowalls.walls[wall_id].loaded_data[i];

				player.element()[0].setAttribute('data-orientation', videowallszGetOrientation(current_data));
				break;
			}
		}

		player.on('playlist-next', function(video_info){
			//video_info = poster URL, Video URL and video token
			//get current ID
			ZiggeoWP.hooks.fire('videowalls_videosite_playlist_step_automated', video_info);
			videowallsUIVideositePlaylistGoTo(wall_id, ZiggeoWP.videowalls.walls[wall_id].videos.current+1);
		});

		player.activate();
	}

	function videowallsUIVideositePlaylistMobile() {
		var walls = document.getElementsByClassName('ziggeo-wall-VideoSitePlaylist');

		for(i = 0, c = walls.length; i < c; i++) {
			if(walls[i].parentElement.getBoundingClientRect().width < 920) {
				if(walls[i].className.indexOf('mobile_wall') === -1) {
					walls[i].className += ' mobile_wall';
				}
		    }
		}
	}



/////////////////////////////////////////////////
// 7. STRIPES DESIGN
/////////////////////////////////////////////////

	// Function used to initiate the process, by creating the main UI and making the call to get the videos
	function videowallsUIStripesCreateUI(wall, id, wall_data) {
		// We set the current video of this wall to the very start
		ZiggeoWP.videowalls.walls[id].videos.current = 0;
		// Helper to tell us if the wall was already created
		var _exists = false;
		var i, c;
		var is_csv = true;

		if(typeof wall_data[0] !== 'undefined' && typeof wall_data[0].token !== 'undefined') {
			is_csv = false;
		}

		wall.className += ' stripes_videowall';

		function createStripe(player_id, video_data) {
			var placeholder = document.createElement('div');
			placeholder.className = 'stripe-player';

			var title_p = document.createElement('div');
			title_p.className = 'video_title';
			title_p.innerText = video_data.title;

			var description_p = document.createElement('div');
			description_p.className = 'video_description';
			description_p.innerText = video_data.description;

			var player_p = document.createElement('div');
			player_p.className = 'ziggeoplayer';
			player_p.id = 'stripes_player_' + player_id;

			placeholder.appendChild(title_p);
			placeholder.appendChild(player_p);
			placeholder.appendChild(description_p);

			var _attrs = {
				width: '100%',
				theme: 'modern',
				themecolor: 'red',
				video: wall_data[i].token
			};

			var player = new ZiggeoApi.V2.Player({
				element: player_p,
				attrs: _attrs
			});

			player.activate();

			return placeholder;
		}

		// Create forward arrow (towards start <<)
		var arrow_before = document.createElement('div');
		arrow_before.className = 'stripes_videowall_arrow_previous inactive';
		arrow_before.addEventListener('click', function(e) {
			videowallsUIStripesScrollStep(e.target, -1, 1);
		});
		//wall.parentElement.insertBefore(arrow_before, wall);
		wall.appendChild(arrow_before);

		// create the element that hosts the players
		var players = document.createElement('div');
		players.className = 'stripes_players_list';
		wall.appendChild(players);

		for(i = 0, c = wall_data.length; i < c; i++) {
			if(is_csv === true) {
				var get_request = ziggeo_app.videos.get(wall_data[i]);

				get_request.success(function (data) {

					wall_data[i] = data;

					players.appendChild( createStripe(i, wall_data[i]) );
				});
			}
			else {
				players.appendChild( createStripe(i, wall_data[i]) );
			}
		}

		players.addEventListener('scrollend', function(e) {
			var list = e.target;
			var prev = list.previousElementSibling;
			var next = list.nextElementSibling;

			// Checking if we are on the far left
			if(list.scrollLeft === 0) {
				prev.className += ' inactive';
			}
			else {
				prev.className = prev.className.replace(' inactive', '');
			}

			// or if we are on the far right
			if(list.scrollWidth === (list.scrollLeft + list.getBoundingClientRect().width)) {
				next.className += ' inactive';
			}
			else {
				next.className = next.className.replace(' inactive', '');
			}
		});

		// Create next arrow (towards end >>)
		var arrow_after = document.createElement('div');
		arrow_after.className = 'stripes_videowall_arrow_next';
		arrow_after.addEventListener('click', function(e) {
			videowallsUIStripesScrollStep(e.target, 1, 1);
		});
		//wall.parentElement.insertBefore(arrow_after, wall.nextElementSibling);
		wall.appendChild(arrow_after);

		// Delay is present to make sure it is not re-set to block
		setTimeout(function() {
			wall.style.display = 'flex';
		}, 200);
	}

	// Expects the arrow element to be passed over as HTML element
	// then the direction should be positive 1 or negative -1 and
	// steps should indicate how many videos we would scroll
	function videowallsUIStripesScrollStep(elm_arrow, direction, steps) {
		var i, c;

		var list = elm_arrow.parentElement.getElementsByClassName('stripes_players_list')[0];
		list.scrollBy(200 * direction * steps, 0);
	}

	// Maybe to add for player that plays to center it automatically
	//.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })


/////////////////////////////////////////////////
// 8. POLYFILL
/////////////////////////////////////////////////

	//Polyfill for .closest()
	if (!Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector || 
									Element.prototype.webkitMatchesSelector;
	}

	if (!Element.prototype.closest) {
		Element.prototype.closest = function(s) {
			var el = this;

			do {
				if (el.matches(s)) return el;
				el = el.parentElement || el.parentNode;
			} while (el !== null && el.nodeType === 1);

			return null;
		};
	}
