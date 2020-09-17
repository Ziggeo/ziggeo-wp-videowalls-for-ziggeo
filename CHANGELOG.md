This file contains the change log info for the `Videowalls for Ziggeo` plugin.

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