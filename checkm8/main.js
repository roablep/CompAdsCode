/***************************************************
 http://ch2lb.checkm8.com/data/813615/main.js
 * CheckM8 Flex Unit Generator JavaScript
 * --------------------------------------
 * @author:  Joel Regus, updated by Philip Browning
 * @version: v1.2
 * @updated: 6/16/2015
 ***************************************************/

/*global cm8js, Hammer, navigator*/

var autoMode,
    background = document.querySelector('.cm8_ad_body'),
    CM8ER,
    clickInteraction,
    clickTracker,
    that = this,
    video,
    videoInformation,
    cta = document.querySelector('.cta'),
    videoContainer = document.querySelector('.video'),
    copy = document.querySelector('.copy'),
    revlon_ultra_hd_lipstick = document.querySelector('.revlon_ultra_hd_lipstick'),
    border = document.querySelector('.border'),
    lipstick = document.querySelector('.lipstick'),
    revlon_love_is_on = document.querySelector('.revlon_love_is_on'),
    background = document.querySelector('.background');

/***************************************************
 * Video
 ***************************************************/


video = (function () {

    'use strict';

    var autoMode,
        buildEventReporter,
        componentName,
        el,
        isUserMobile,
        onPosterClick,
        onVideoClick,
        onVideoEnd,
        onVideoError,
        onVideoReady,
        onVideoStart,
        onVideoStop,
        VER,
        videoPlayer,
        videoEnded = false;

    buildEventReporter = function buildEventReporter() {
        VER = new cm8js.VER(videoPlayer, componentName);
    };

    isUserMobile = function isUserMobile() {
        var isMobile = {
            Android: function () {
                return navigator.userAgent.match(new RegExp('Android', 'i'));
            },
            BlackBerry: function () {
                return navigator.userAgent.match(new RegExp('BlackBerry', 'i'));
            },
            iOS: function () {
                return navigator.userAgent.match(new RegExp('iPhone|iPod|iPad', 'i'));
            },
            Opera: function () {
                return navigator.userAgent.match(new RegExp('Opera Mini', 'i'));
            },
            Windows: function () {
                return navigator.userAgent.match(new RegExp('IEMobile', 'i'));
            },
            any: function () {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
            }
        };

        if (isMobile.any()) {
            return true;
        }

        return false;
    };

    onPosterClick = function onPosterClick() {
        // Remove the class vjs-has-ended from the video player.
        var videoElement = document.getElementById(videoPlayer.getVideoId());
        videoElement.className = videoElement.className.replace(' vjs-has-ended', '');

        if (!isUserMobile()) {
            videoPlayer.video.posterImage.hide();
        }
    };

    onVideoClick = function onVideoClick() {
        if (!that.clickInteraction) {
            that.clickInteraction = true;
        }
        CM8ER.reportClick(componentName);
    };

    onVideoEnd = function onVideoEnd() {
        if (!isUserMobile()) {
            videoPlayer.video.posterImage.show();
        }

        CM8ER.exCall('CM8_VIDEO_END');
        videoEnded = true;
    };

    onVideoError = function onVideoError() {
        video.dispose();
    };

    onVideoReady = function onVideoReady() {
        buildEventReporter();
        videoPlayer.video.posterImage.a.addEventListener('click', onPosterClick);
        video.show();

        videoPlayer.video.on('video-start', onVideoStart);
        videoPlayer.video.on('video-stop', onVideoStop);
        videoPlayer.video.on('video-end', onVideoEnd);
        videoPlayer.video.on('video-click', onVideoClick);

        // Fire ad-ready here
        CM8ER.exCall('CM8_VIDEO_READY');

        if (autoMode) {
            video.play();
        }
    };

    onVideoStart = function onVideoStart() {
        CM8ER.exCall('CM8_VIDEO_START');
    };

    onVideoStop = function onVideotop() {
        CM8ER.exCall('CM8_VIDEO_STOP');
    };

    return {

        // @container: class of project (player) container
        // @videoContainer: id of div where you want to build the video
        // @videoId: id on the generated video tag
        initialize : function initialize() {
            autoMode = videoInformation.autoMode || that.autoMode;
            componentName = 'Video';
            el = document.querySelector('.video-player');

            // Options does not take autoplay, for autoMode, simply play video
            // when video is ready in a callback giving us more granular control.
            var options = {
                    'container': 'video-container', //unique id of containing tag on the page
                    'videoId': 'video', // Unique id for the video
                    'controls' : true,
                    'preload': 'auto',
                    'autoplay': autoMode || false,
                    'muted' : true, // If initial mute, on user-initiated unmute,video will start again with sound
                    'width' : 'auto', // Responsive width
                    'height' : 'auto',  // Responsive height
                    'poster': videoInformation.poster || '',
                    'swf' : 'http://ch2lb.checkm8.com/data/739735/video-js_v1.swf', // SWF Fallback
                    'click': videoInformation.clickTracker || '', // Ad clickthrough
                    'media': [
                        {
                            'src': videoInformation.videoName + '.mp4',
                            'type': 'video/mp4'
                        },
                        {
                            'src': videoInformation.videoName + '.ogg',
                            'type': 'video/ogg' // Remember this is video/ogg NOT video/ogv otherwise FF will not play it!
                        },
                        {
                            'src': videoInformation.videoName + '.webm',
                            'type': 'video/webm'
                        }
                    ]
                };

            videoPlayer = new cm8js.VideoPlayer();
            videoPlayer.initialize(options, onVideoReady, onVideoError);
        },

        dispose: function dispose() {
            if (videoPlayer) {
                videoPlayer.dispose();
            }
            this.hide();
        },

        height: function height() {
            if (videoPlayer) {
                return videoPlayer.video.height();
            }
            return null;
        },

        hide: function hide() {
            el.style.display = 'none';
        },

        isPaused: function isPaused() {
            if (videoPlayer) {
                return videoPlayer.isPaused();
            }
            return null;
        },

        isReady: function isReady() {
            if (videoPlayer) {
                return true;
            }
            return false;
        },

        pause: function pause() {
            if (videoPlayer) {
                videoPlayer.pause();
            }
        },

        play: function play() {
            if (videoPlayer) {
                if (videoEnded) {
                    videoPlayer.replay();
                    videoEnded = false;
                } else {
                    videoPlayer.play();
                }
            }
        },

        replay: function replay() {
            if (videoPlayer) {
                videoPlayer.replay();
            }
        },

        show: function show() {
            el.style.display = 'block';
        },

        stop: function stop() {
            if (videoPlayer) {
                videoPlayer.stop();
            }
        },

        width: function width() {
            if (videoPlayer) {
                return videoPlayer.video.width();
            }
            return null;
        }
    };
}());

/***************************************************
 * Utilities
 ***************************************************/

function triggerClick() {
    video.pause();
    CM8ER.reportClick();
    CM8ER.triggerClick(clickTracker);
}

/***************************************************
 * Main
 ***************************************************/

function main() {
    //Code Goes Here
}

/***************************************************
 * Initialize
 ***************************************************/

(function init() {
    this.CM8ERCounter = this.CM8ERCounter || 0;

    try {
        CM8ER = window.utilities.CM8ER;
        clickTracker = window.utilities.clickTracker;

        videoInformation = window.utilities.videoInformation;
        video.initialize();

        main();
    } catch (e) {
        if (this.CM8ERCounter < 1000) {
            setTimeout(function () {
                init();
            }, 50);

            this.CM8ERCounter++;
        }
    }
}());

/***************************************************
 * Event Listeners
 ***************************************************/

cta.addEventListener('click', function () {
    triggerClick();
    // Report Event
});

copy.addEventListener('click', function () {
    triggerClick();
    // Report Event
});

revlon_ultra_hd_lipstick.addEventListener('click', function () {
    triggerClick();
    // Report Event
});

border.addEventListener('click', function () {
    triggerClick();
    // Report Event
});

lipstick.addEventListener('click', function () {
    triggerClick();
    // Report Event
});

revlon_love_is_on.addEventListener('click', function () {
    triggerClick();
    // Report Event
});

background.addEventListener('click', function () {
    triggerClick();
    // Report Event
});

