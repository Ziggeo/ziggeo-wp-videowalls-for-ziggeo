=== VideoWalls for Ziggeo ===
Contributors: oliverfriedmann, baned, carloscsz409, natashacalleia
Tags: video, ziggeo, videowall, playlist, video gallery
Requires at least: 3.0.1
Tested up to: 6.3
Stable tag: 1.15
Requires PHP: 5.2.4
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

This plugin utilizes the power of Ziggeo to make it easy to share galleries and walls of videos on your website quickly and easily.

Please note that you need to install and setup [Ziggeo plugin](https://wordpress.org/plugins/ziggeo/) first. This plugin is offered as an extension of the same.

== Who is this plugin for? ==

Are you looking to showcase some videos?

Are you looking to have themed galleries of videos on your website?

Maybe need a simple way of showcasing ton of videos on your pages?

If on any questions above the answer is yes, then this plugin is for you!

== Quick Description ==

Video is future. Gigants know this and have been saying more and more recently. Ads are better when they are videos. You can tell more with video than with image. Showing yourself, or what you do is more interesting with a video. Video, video, video. And this pugin is just that, a whole lot of videos.

You can choose the design that you want to showcase your videos as. Instead of creating a lot of code, all you would do is to just install and style the walls of videos to meet your imagination. Let it run wild and be part of video revolution today!

= Why Ziggeo? =

Ziggeo video playback and recording is built upon its own framework. It allows you to record and play videos on various platforms out of the box. Stop thinking about the video type specific to browsers or technology available on specific platform. Ziggeo API is unifying the design of your video player and recorder and makes all processes just work.

Ziggeo is designed to do that using same calls and methods while our backend works out all of the specifics for you.

= Support =

We provide active support to all that have any questions or need any assistance with our plugin or our service.
To submit your questions simply go to our [Help Center](https://support.ziggeo.com/hc/en-us). Alternatively we have also added contact us page into our plugin so feel free to use that one as well.

= Video Wall =

Were you interested in having an option not only to collect videos in your comments, instead to show them as well? Something like a video gallery?

Well, if you are thinking "oh, that would be so nice" - we hear you! We also want to say that that is exactly what we did. As per your requests, we have thought of a way to introduce video walls that work with just a few lines in any part of your post or page.

So what happens is that you add a call to your video wall template like so:

`
[ziggeovideowall myTemplate]
`

As you do, your post will show the wall as per template setup, which means that you could do one of the following:
1. Show video gallery / video wall as soon as the page finishes loading
1. Request for video to be posted as a comment on the post to see the video wall
1. Show a message if no videos are present - or show another template instead.

* Yes, you read that correctly. If you show your video wall, and you want to show a template within it - that is possible allowing you to quickly add more videos.

By default the video wall will show you the videos made on the specific post (the one it is on), however if you wish to show videos from other posts or that are not associated yet with your WordPress, you can do that as well through videos_to_show parameter.

You can read more about Video Wall templates on the following useful links:
[Introduction to VideoWall on our blog](https://ziggeo.com/blog/videowall-the-best-way-to-easily-show-a-video-gallery-on-your-wordpress-based-website/)
and
[Introduction to showing videos from other post on our forum](https://support.ziggeo.com/hc/en-us/community/posts/212117427-VideoWall-parameters-introducing-new-changes)

= Templates =

This plugin introduces videowall tempalte into the Ziggeo WP Core plugin templates editor. You can then add, modify and edit it as you would any other template.

Videowall template base would look like so: `[ziggeovideowall]`

Please check FAQ section for some of the questions related to the same.

= Hooks =

With Videosite Playlist template we have started introducing hooks into the videowalls plugin. Want to have more? Just let us know.

To find the hooks, you can search our files (for those that like to make sure we told you all) for `ZiggeoWP.hooks.fire`.

We have added the following hooks:
1. videowalls_videosite_playlist_create_details ({ data: video_data details_element: element_reference })
2. videowalls_videosite_playlist_goto (id)
3. videowalls_videosite_main_player_pre_create
4. videowalls_videosite_playlist_step_automated (short video info)


You can set your code to react to hooks in the following manner:

ZiggeoWP.hooks.set(hook_name, unique_identifier, function(data) {});

This would look like so:

[javascript]
ZiggeoWP.hooks.set('videowalls_videosite_playlist_create_details', 'ziggeo-details-extend', function(data) {
	//here we show you how to show the video token in the description area
	//You could do anything here, even add the details like you would see on YouTube under a video
	var _c = document.createElement('div');
	_c.innerHTML = data.data.token;
	data.details_element.appendChild(_c);
});
[/javascript]

= Improvements and Feedback =

If you experience any issues with the plugin, please let us know. You can do that through options shown in plugins *Contact Us* tab, or if you were in contact with us before, just let us know in the same manner as before, or over our [Ziggeo Forum in WordPress Plugin section](https://support.ziggeo.com/hc/en-us/community/topics/200753347-WordPress-plugin).

We value your suggestions in regards to all aspects of our service and plugin as well, so use this and help us help you.

== Installation ==

There are several ways to power your WordPress with video recording and video playback features.

= Manually =
1. Upload the directory to your plugins folder (by default this is) `/wp-content/plugins/` directory and click on *VideoWalls for Ziggeo* in the Settings menu.

= Automatically =
1. Go to Admin panel of your WordPress website and click on Plugins -> Add New
 1. Search for "Ziggeo"
 1. Click *Install* on "VideoWalls for Ziggeo"
 1. Activate plugin
 1. Go to *VideoWalls for Ziggeo Video* under Ziggeo Video menu

* That is it, your plugin is installed.

== Screenshots ==

1. Videowall Design "Paged wall"
2. Videowall Design: "Slidewall"
3. Videowall Design: "Mosaic Grid" Wall (Endless - adds more videos on scroll)
4. Videowall Design: "ChessBoard Grid" Wall
5. Videowall Design: "Videosite Playlist" Wall: (Desktop layout)
6. Videowall Design: "Videosite Playlist" Wall: (Mobile layout)
7. Videowall Design: "Stripes" (Mobile layout)
8. Videowall Design: "Stripes" (Small width)
9. Videowall Design: "Stripes" (Larger width)
10. Core plugin Template editor integration - videowall templates setup


== FAQ ==

= Does this plugin change Ziggeo core plugin =

No. We are using hooks (actions and filters) to hook into the Ziggeo core WP plugin. As such the changes are applied only while both plugins is running.

= What happens to videowall fields if integration is disabled at a later time? =

*A:* If you disable the integration, you will be stopping it from working, and as such it would not show the walls any more. There might be some text output representing your videowall shortcode, however that depends on your setup.

= Can we modify the videowalls or create new ones? =

Of course! Just let us know on our forum [under WordPress plugin topic](https://support.ziggeo.com/hc/en-us/community/topics/200753347-WordPress-plugin) and we would be happy to help you get started. We might already have some helpful tips on how to do the same as well.

= I am just interested in changing few styles =

In that case all you need are few classes

`.ziggeo_videoWall` - To style videowall template (video gallery if you prefer) 
`.ziggeo_wall_title` - To style the wall title if any is given
`.ziggeo_wallpage` - to style video wall pages
`.ziggeo_wallpage > ziggeo` - to style the embedings within the video wall (from here standard Ziggeo embedding CSS codes will work properly)
`.ziggeo_wallpage_number` - to style the page number buttons
`.ziggeo_videowall_slide_previous` - to style the < (previous arrow)
`.ziggeo_videowall_slide_next` - to style > (next arrow)

You can of course use your own CSS code, and with classes available for each element of the videowall this should be something very simple.

= Can we give you our feedback? =

Of course! We welcome all feedback and suggestions, that is how we got to here, so do share with us your thoughts.

= How can I request a feature? =

Leave a rating for our plugin. This helps dedicate more time on plugin improvements. Once that is done, leave a comment about your feature request on our [WP forum](https://support.ziggeo.com/hc/en-us/community/topics/200753347-WordPress-plugin). This will allow you and others to boost up the features that you like.

= Why there are some videos that can not be loaded in VideoWall? =

If you notice in your console the following error: `NetworkError: 403 Forbidden - link to video snapshot` or if you check the link directly and you see `This video is currently under moderation` it means that your video wall was able to load the video, however you have checked `Client cannot view unaccepted videos` in your dashboard - that is why you are shown the same.

If you are still not sure about how to resolve that, just let us know.

= We open a page with video wall, however no videos are shown even with video wall set to load right away =

To show videos you need to have videos on that specific page. This is done to allow you to show any videos from within your Ziggeo account that are specific to the post/page you are currently on. To show some videos, you can record your video in the post, or by recording it in the comments. All others that are added as video comments will be shown after new recording is made (to those that do it) or for all those that come to your page (depending on your setup).

You can also tag your videos in our dashboard with the ID of the page that you want them shown on and voila, refresh your browser and they should be there.

== Changelog ==

= 1.15 =
* New Feature: The videowalls now also accept the list of video tokens to be played instead of using the API to find them. Useful if you have a list of tokens that you want to play within some page using some specific videowall design. This is possible to do with `show_pages`, `slide_wall`, `videosite_playlist` and `stripes` (not with `chessboard_grid`, `mosaic_grid`).
* Fixed: Cleaned up some scripts and removed limitation that could have resulted in not all columns of Mosaic Grid being filled out.