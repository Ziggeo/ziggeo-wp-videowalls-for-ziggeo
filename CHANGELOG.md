This file contains the change log info for the `Videowalls for Ziggeo` plugin.

= 1.8 =
* Improvement: Chessboard grid videowall template is now behaving properly - in a chess type manner.

= 1.7 =
* Fix: Added a fix that resolves the videowall not grabbing the right information for getting the videos through index.

= 1.6 =
* Introducing: Added `show_delay` parameter to allow you to change the time after which the videowall is shown when show parameter is used (defaults to 2 seconds). Not setting it up, or leaving on 2 seconds makes it behave as it was before, so no action needed. Please note smaller times are not recommended and can cause issues, do test it out and give it enough time per the same.
* Introducing: Added `auto_refresh` parameter that will actively check for new videos. 0 to turn it off (so works as so far) or change it to any positive number for amount of seconds to wait before a new check. Please note that closer the checks are together more resources you will spend. Defaults to never (0).

* Improvement: Small CSS improvement to help bring the previous and next arrows in slidewall up compared to video which was not case for all setups.
* Improvement: Videowall players are now orientation aware and all videos are marked with [data-orientation="{orientation}"], where {orientation} can be "landscape" or "portrait".

* Fix: Switching pages will pause the video playback for videos on previous pages.

= 1.5 =
* Updated info file to help showcasing addons in Addon store
* Added Videowalls shortcode support
* Moved changelog into a separate file to help with short readme and useful changelog for those that want to check it out (look for CHANGELOG.md)
* Added a check for core plugin being installed, just to avoid cases where it is not active or installed before the videowall plugin is and possibly causing inconvenience.
* Added various new events that will allow you to change the way videowalls or video players within them are made. This includes:
 1. `videowallsz_wall_request_made`
 2. `videowallsz_wall_not_found`
 3. `videowallsz_wall_invalid_reference`
 4. `videowallsz_fresh_wall`
 5. `videowallsz_wall_index_data_start`
 6. `videowallsz_wall_index_data_finished`
 7. `videowallsz_wall_index_error`
 8. `videowallsz_no_videos_template`
 9. `videowallsz_no_videos_message`
 10. `videowallsz_wall_video_add`
 11. `videowallsz_endlesswall_video_add`
 12. `videowallsz_wall_loading_more_text`
 13. `videowallsz_pagedwall_video_add`
 14. `videowalls_videosite_playlist_create_details`
 15. `videowalls_videosite_playlist_goto`
 16. `videowalls_videosite_main_player_pre_create`
 17. `videowalls_videosite_playlist_step_automated`
* Small fix to allow px and % to be given to video player width
* Added new `video_stretch` parameter to be easily added to the players in the videowall, which helps further fine tune the video's look within the videowalls.
* Improvement: Added a check if the core plugin is available and report in admin if it is not.

= 1.4 =
* Changed the tags parsing for index calls so that it supports all of the tags supported by Ziggeo core plugin. This means you can now use `%USER_ID%`, `%USER_NAME_FIRST%`, `%USER_NAME_LAST%`, `%USER_NAME_FULL%`, `%USER_NAME_DISPLAY%`, `%USER_EMAIL%` and `%USER_USERNAME%` in your templates.
* Added better way of handling the plugin options

= 1.3 =
* Using new way to create the addon page through core plugin function calls
* using the new way to add the integration info to core pages
* Fixed the mosaic wall issue where videowall was not rendering properly
* Fixed issue where endless walls would not be shown

= 1.2. =
* Fixed issue where tags were removed and not used in some cases, showing all videos instead of just some

= 1.1. =
* Made some cleanup of code
* Introducing YouTube like videowall "VideoSite Playlist"
* Changed how the processing of videowalls is done on frontend and backend
* Introduced a better way to handle defaults for videowalls

= 1.0 =
* First version