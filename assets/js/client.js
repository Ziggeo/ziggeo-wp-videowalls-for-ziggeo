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
//	3. Filtering
//		* videowallszFilterApproved()
//		* videowallszFilterRejected()
//		* videowallszFilterPending()
//	4. Endless Walls
//		* videowallszUIVideoWallEndlessAddVideos()
//		* videowallszUIVideoWallEndlessOnScroll()
//	5. "Static" Walls
//		* videowallszUIVideoWallPagedAddVideos()
//		* videowallszUIVideoWallPagedShowPage()
//	6. VideoSite Playlist Walls
//	7. Polyfill
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
	});




/////////////////////////////////////////////////
// 2. GENERAL FUNCTIONALITY
/////////////////////////////////////////////////

	//in case there are multiple walls on the same page, we want to be sure not to cause issues.
	// This should catch it and not declare the function again.
	//show video wall based on its ID
	function videowallszUIVideoWallShow(id, searchParams) {

		if(searchParams === undefined || searchParams === "undefined" || searchParams === null || 
			typeof(searchParams) != "object") {
			searchParams = {};
		}

		var search_obj = {
			limit: 100,
			tags: (ZiggeoWP.videowalls.walls[id].tags) ? ZiggeoWP.videowalls.walls[id].tags : "",
			skip: (searchParams.skip) ? searchParams.skip : 0,
			approved: ZiggeoWP.videowalls.walls[id].status
		}

		//reference to wall
		var wall = document.getElementById(id);

		//lets check if wall is existing or not. If not, we break out and report it.
		if(!wall) {
			ziggeoDevReport('Exiting function. Specified wall is not present');
			return false;
		}

		if(!ZiggeoWP.videowalls.walls[id]) {
			ziggeoDevReport('Wall found, however no data found for the same');
			return false;
		}

		if(ZiggeoWP.videowalls.walls[id].indexing.fresh === true) {
			//a fresh wall

			var wallClass = 'ziggeo-wall';

			switch(ZiggeoWP.videowalls.walls[id].indexing.design) {
				case 'show_pages': {
					wallClass += '-showPages';
					break;
				}
				case 'slide_wall': {
					wallClass += '-slideWall';

					break;
				}
				case 'chessboard_grid': {
					wallClass += '-chessboardGrid';

					break;
				}
				case 'mosaic_grid': {
					wallClass += '-mosaicGrid';
					break;
				}
				case 'videosite_playlist': {
					wallClass += '-VideoSitePlaylist';
					break;
				}
			}

			wall.className = "ziggeo_videoWall " + wallClass;
		}

		//To show the page we must first index videos..
		//We are making it get 100 videos data per call
		var _index = ziggeo_app.videos.index( search_obj );

		_index.success( function (data) {

			//We first check if we have any videos matching the requirements of the wall
			if(ZiggeoWP.videowalls.walls[id].indexing.status === 'approved') {
				data = videowallszFilterApproved(data);
			}
			else if(ZiggeoWP.videowalls.walls[id].indexing.status === 'rejected') {
				data = videowallszFilterRejected(data);
			}
			else if(ZiggeoWP.videowalls.walls[id].indexing.status === 'pending') {
				data = videowallszFilterPending(data);
			}
			//Else it is all and we do not need to filter anything (status: "all")

			if(data.length > 0) {
				//we got some videos back
				//go through videos

				//Lets set up the autoplay if it should be set
				if(ZiggeoWP.videowalls.walls[id].videos.autoplay === true) {
					videowallszUISetupAutoplay(id);
				}

				//if showPages or slideWall are true, then we use the original walls with pages
				if(ZiggeoWP.videowalls.walls[id].indexing.design == 'show_pages' ||
					ZiggeoWP.videowalls.walls[id].indexing.design == 'slide_wall') {

					//HTML output buffer
					var html = '';

					//set the video wall title
					html += ZiggeoWP.videowalls.walls[id].title;

					videowallszUIVideoWallPagedAddVideos(wall, id, html, data);
				}
				//Are we trying to create a Youtube like playlist?
				else if(ZiggeoWP.videowalls.walls[id].indexing.design == 'videosite_playlist') {
					videowallszUIVideoSitePlaylistCreate(wall, id, data);
				}
				//if we are here, then this is one of the newer walls with endless scroll..
				else {
					//lets attach the event listener..
					window.addEventListener( 'scroll',  videowallszUIVideoWallEndlessOnScroll, false );

					if( ZiggeoWP.videowalls.walls[id]['continueFrom'] ) {
						ZiggeoWP.videowalls.walls[id]['continueFrom'] += data.length;
					}
					else {
						ZiggeoWP.videowalls.walls[id]['continueFrom'] = data.length;
					}

					videowallszUIVideoWallEndlessAddVideos(wall, id, data, true);
				}
			}
			else {
				//no results

				if(ZiggeoWP.videowalls.walls[id].indexing.fresh === false) {
					//We had some videos already..
					var tmp = document.getElementById('ziggeo-endless-loading_more');

					if(tmp) {
						tmp.innerHTML = "No more videos..";
					}
				}
				else {
					//This is the first request
					//follow the procedure for no videos (on no videos)
					ziggeoDevReport('No videos found matching the requested: ' + JSON.stringify(search_obj));

					//Lets process no videos which will return false or built HTML code.
					var html = videowallszUIVideoWallNoVideos(id, ZiggeoWP.videowalls.walls[id].title);
				}

				//cancel the scrolling event when we have no more videos to load..
				if(ZiggeoWP.videowalls.endless === id) {
					ZiggeoWP.videowalls.endless = null;
				}

				//function returns false if it should break out from the possition call was made.
				if(html === false) { return false; }

				if(ZiggeoWP.videowalls.walls[id].indexing.fresh === true) {
					wall.innerHTML = html;
				}
			}

			//The videowall is no longer fresh, so all initial actions should no longer be caried out..
			ZiggeoWP.videowalls.walls[id].indexing.fresh = false;

			//We are currently not processing any videos (in video wall context)
			ZiggeoWP.videowalls.walls[id].processing = false;
		});

		_index.error(function (args, error) {
			ziggeoDevReport('This was the error that we got back when searching for ' + JSON.stringify(args) +  ':' + error, 'error');
		});
	}

	//handler for the cases when either no videos are found or videos found do not match the status requested
	// (not to be mistaken with 'video status').
	function videowallszUIVideoWallNoVideos(id, html) {

		//Is the vall set up to be hidden when there are no videos?
		if(ZiggeoWP.videowalls.walls[id].onNoVideos.hideWall) {
			//Lets still leave a note about it in console.
			ziggeoDevReport('VideoWall is hidden');
			return false;
		}

		//adding page - has additional (empty) class to allow nicer styling
		html += '<div id="' + id + '_page_1' + '" class="ziggeo_wallpage empty">';

		//Should we show some template?
		if(ZiggeoWP.videowalls.walls[id].onNoVideos.showTemplate) {
			html += '<ziggeoplayer ' + ZiggeoWP.videowalls.walls[id].onNoVideos.templateName + '></ziggeoplayer>';
		}
		else { //or a message instead?
			html += ZiggeoWP.videowalls.walls[id].onNoVideos.message;
		}
		//closing the page.
		html += '</div>';

		return html; //return the code we built..
	}

	//Sets up the events so that we can handle the autoplay in videowalls by utilizing app wide embedding events
	//It does not create the wall, so it does not depend on a specific videowall
	function videowallszUISetupAutoplay(wall_id) {

		//We need to make sure that autoplay either:
		//1. always goes from one played video to the next regardless if some video is played manually
		//2. continue playing only from the video that was last played
		//3. should check right at start if the autoplay is even allowed there..
		//* otherwise you would be starting an autoplay of next video every time you click to play one

		if(ZiggeoWP.videowalls.walls[wall_id].videos.autoplay === true) {
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
				if(!ZiggeoWP.videowalls.walls[current_wall_ref.id] ||
					ZiggeoWP.videowalls.walls[current_wall_ref.id].videos.autoplay !== true) {
					return false;
				}

				ZiggeoWP.videowalls.walls[current_wall_ref.id].current_player = embedding;
			});

			return true;
		}

		return false;
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
	function videowallszUIVideoWallEndlessAddVideos(wall, id, data, _new) {

		var html = wall;

		var usedVideos = 0;
		var j = data.length;
		
		if(ZiggeoWP.videowalls.walls[id]['loaded_data'] && _new === true) {
			j -= ZiggeoWP.videowalls.walls[id]['loaded_data'].length;
		}

		//Chessboard grid
		if(ZiggeoWP.videowalls.walls[id].indexing.design === 'chessboard_grid') {
			var _width = (html.getBoundingClientRect().width / 8) - 4;
			_width = Math.round(_width);
		}

		//Mosaic grid codes..
		if(ZiggeoWP.videowalls.walls[id].indexing.design === 'mosaic_grid') {

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
		}

		//variable holding the current video (position) in the current row
		var _mosaic_row_count = 0;

		for(i = 0, tmp=''; i < j; i++, tmp='', _mosaic_row_count++) {

			//break once we load enough of videos
			if(i >= ZiggeoWP.videowalls.walls[id].indexing.perPage) {
				break;
			}

			var tmp_embedding = '<ziggeoplayer ';

			if(ZiggeoWP.videowalls.walls[id].indexing.design === 'chessboard_grid') {

				tmp_embedding += ' ziggeo-width="' + _width + '"';
			}
			else if(ZiggeoWP.videowalls.walls[id].indexing.design === 'mosaic_grid') {
				//See if we need to go to new row
				if(_mosaic_row_max === _mosaic_row_count) {
					_mosaic_row_count = 0;
				}

				tmp_embedding += ' ziggeo-responsive';
			}
			else {
				tmp_embedding += ' ziggeo-width=' + ZiggeoWP.videowalls.walls[id].videos.width +
								' ziggeo-height=' + ZiggeoWP.videowalls.walls[id].videos.height;
			}

			tmp_embedding += ' ziggeo-video="' + data[i].token + '"' +
							( (usedVideos === 0 && ZiggeoWP.videowalls.walls[id].videos.autoplay &&
								ZiggeoWP.videowalls.walls[id].indexing.fresh === true) ? ' ziggeo-autoplay ' : '' );

			//in case we need to add the class to it
			if(ZiggeoWP.videowalls.walls[id].videos.autoplaytype !== "") {
				tmp_embedding += ' class="ziggeo-autoplay-' +
					( ( ZiggeoWP.videowalls.walls[id].videos.autoplaytype === 'continue-end' ) ? 'continue-end' : 'continue-run' ) +
					'"';
			}

			//finalize the embedding
			tmp_embedding += '></ziggeoplayer>';

			if(ZiggeoWP.videowalls.walls[id].indexing.design === 'mosaic_grid') {
				//@ADD - sort option as bellow, this is just a quick test

				html.children[_mosaic_row_count].insertAdjacentHTML('beforeend', tmp_embedding);
				usedVideos++;
				data[i] = null;//so that it is not used by other ifs..
			}
			else {
				html.insertAdjacentHTML('beforeend', tmp_embedding);
				usedVideos++;
				data[i] = null;//so that it is not used by other ifs..
			}
		}

		var tmp = document.getElementById('ziggeo-endless-loading_more');

		if(tmp) {
			tmp.parentNode.removeChild(tmp);
		}
		else {
			var loadingElm = document.createElement('div');
			loadingElm.id = "ziggeo-endless-loading_more";
			loadingElm.innerHTML = "Loading More Videos..";
			//@HERE - make this string translatable for people using WPML.
			//It will have two strings - loading more and no more videos..
			wall.parentNode.appendChild(loadingElm, wall);
		}

		ZiggeoWP.videowalls.endless = id;

		for(i = -1, j = data.length; i < j; j--) {
			//break once we load enought of videos
			if(data[j] === null) {
				data.splice(j, 1);
			}
		}

		if(data.length > 0) {
			ZiggeoWP.videowalls.walls[id]['loaded_data'] = data;
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
		}
		else {
			//OK so there is obviously no wall. Instead of recreating the same check each time, lets clean up..
			(document.removeEventListener) ? (
				window.removeEventListener( 'scroll',  videowallszUIVideoWallEndlessOnScroll ) ) : (
				window.detachEvent( 'onscroll', videowallszUIVideoWallEndlessOnScroll) );
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




/////////////////////////////////////////////////
// 5. "STATIC" WALLS
/////////////////////////////////////////////////

	// function to handle the video walls with the pagination
	function videowallszUIVideoWallPagedAddVideos(wall, id, html, data) {

		//number of videos per page currently
		var currentVideosPageCount = 0;
		//total number of videos that will be shown
		var usedVideos = 0;
		//What page are we on?
		var currentPage = 0;
		//did any videos match the checks while listing them - so that we do not place multiple pages since the count stays on 0
		var newPage = true;

		for(i = 0, j = data.length, tmp=''; i < j; i++, tmp='') {

			var tmp_embedding = '<ziggeoplayer ' +
							' ziggeo-width=' + ZiggeoWP.videowalls.walls[id].videos.width +
							' ziggeo-height=' + ZiggeoWP.videowalls.walls[id].videos.height +
							' ziggeo-video="' + data[i].token + '"' +
							( (usedVideos === 0 && ZiggeoWP.videowalls.walls[id].videos.autoplay) ? ' ziggeo-autoplay ' : '' );

			//in case we need to add the class to it
			if(ZiggeoWP.videowalls.walls[id].videos.autoplaytype !== "") {
				tmp_embedding += ' class="ziggeo-autoplay-' +
					( ( ZiggeoWP.videowalls.walls[id].videos.autoplaytype === 'continue-end' ) ? 'continue-end' : 'continue-run' ) +
					'"';
			}

			//finalize the embedding
			tmp_embedding += '></ziggeoplayer>';

			tmp += tmp_embedding;
			usedVideos++;
			currentVideosPageCount++;
			data[i] = null;//so that it is not used by other ifs..

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
		if(usedVideos === 0 && i > 0) {
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

		var pageID = id + '_page_' + page;

		var newPage = document.getElementById(pageID);

		//Get all pages under current wall
		var pages = wall.getElementsByClassName('ziggeo_wallpage');

		//Hide all of the pages
		for(i = 0, j = pages.length; i < j; i++) {
			pages[i].style.display = 'none';
		}

		//set the visual indicator of what page is selected
		var pageNumbers = wall.getElementsByClassName('ziggeo_wallpage_number');

		if(current === null || typeof current === 'undefined') {
			current = wall.getElementsByClassName('ziggeo_wallpage_number')[page-1];
		}

		//This is only active if we show page numbers / page buttons
		if(current) {
			//reset style of the page number buttons
			for(i = 0, j = pageNumbers.length; i < j; i++) {
				pageNumbers[i].className = 'ziggeo_wallpage_number';
			}

			//adding .current class to the existing list of classes
			current.className = 'ziggeo_wallpage_number current';
		}

		newPage.style.display = 'block';
	}




/////////////////////////////////////////////////
// 6. VIDEOSITE PLAYLIST WALLLS
/////////////////////////////////////////////////

	function videowallszUIVideoSitePlaylistCreate(wall, id, data) {

		ZiggeoWP.videowalls.walls[id]['loaded_data'] = data;
		//The ID for the video 
		ZiggeoWP.videowalls.walls[id].videos.current = 0;

		//Create main

		var _main = document.createElement('div');
		_main.id = 'videosite_playlist_m_' + id;
		_main.className = 'videosite_playlist_main';

		var _list = [];

		for(i = 0, j = data.length; i < j; i++) {
			//Create a list for main player
			_list.push(data[i].token);
		}

		var _playlist = document.createElement('div');
		_playlist.className = 'video_placeholder';

		_main.appendChild(_playlist);

		_main.appendChild(videowallszUIVideositePlaylistDetailsCreate({
			title: data[0].title,
			description: data[0].description,
			created: videowallszGetDateFromUnix(data[0].created),
			__complete: data[0]
		}));

		wall.appendChild(_main);

		videowallsUIVideositePlaylistCreatePlayer(id, _playlist, _list, false);

		//Create side
		var _side = videowallszUIVideositePlaylistSidePopulate(id, data);

		if(_side !== null) {
			wall.appendChild(_side);
		}

		//lets show it:
		wall.style.display = 'block';

		//Let us make the main and side of same height
		_side.style.height = _main.getBoundingClientRect().height + 'px';

		window.addEventListener('resize', function() {
			_side.style.height = _main.getBoundingClientRect().height + 'px';
		});

		//Thank you Daniel: https://stackoverflow.com/a/39312522
		new ResizeObserver(function() {
			_side.style.height = _main.getBoundingClientRect().height + 'px';
		}).observe(_main)

	}

	function videowallszUIVideositePlaylistSidePopulate(wall_id, data) {

		var _new = false;

		//Let us see if this is already created or not
		if(document.getElementById('videosite_playlist_s_' + wall_id)) {
			var _side = document.getElementById('videosite_playlist_s_' + wall_id);
		}
		else {
			var _side = document.createElement('div');
			_side.id = 'videosite_playlist_s_' + wall_id;
			_side.className = 'videosite_playlist_side';
			_new = true;
		}

		for(i = 0, j = data.length; i < j; i++) {
			var _list_div = document.createElement('div');
			_list_div.id = "videosite_playlist-v-" + i;

			if(i === 0) {
				_list_div.className = 'current';
			}

			var _img_div = document.createElement('div');
			_img_div.className = 'img';
			var _img = document.createElement('img');
			_img.src = 'https://' + data[i]['embed_image_url'];
			_img_div.appendChild(_img);

			var _title = document.createElement('div');
			_title.innerHTML = data[i]['title'];
			_title.className = 'video_title';

			var _time = document.createElement('div');
			//TODO: we could add here a check to see if it is over minute, etc.
			_time.innerHTML = data[i]['duration'] + 's';
			_time.className = 'video_duration';

			//We can add here title, image and time
			_list_div.appendChild(_img_div);
			_list_div.appendChild(_title);
			_list_div.appendChild(_time);

			_side.appendChild(_list_div);

			var _main_ref = document.getElementById('videosite_playlist_m_' + wall_id);
			_main_ref = _main_ref.getElementsByClassName('video_placeholder')[0];

			if(_new) {
				_list_div.addEventListener('click', function(evnt) {
					//Play from this video

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
		}

		if(_new) {
			return _side;
		}

		return null;
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
			theme: "modern",
			themecolor: "red",
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

		player.on('playlist-next', function(video_info){
			//video_info = poster URL, Video URL and video token
			//get current ID
			ZiggeoWP.hooks.fire('videowalls_videosite_playlist_step_automated', video_info);
			videowallsUIVideositePlaylistGoTo(wall_id, ZiggeoWP.videowalls.walls[wall_id].videos.current+1);
		});

		player.activate();
	}



/////////////////////////////////////////////////
// 7. POLYFILL
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
