/**
http://ch2lb.checkm8.com/data/static/video-event-reporter_June_2015.js
 * Video Event Reporter (VER)
 * @ author: Zameer Rehmani
 * Based on Video Event Reporter AS Class by @ author: Joel Regus
 */

var cm8js = window.cm8js || {},
    CM8ER = window.CM8ER || {
        startCounting: function () {
            'use strict';
            log(arguments);
        },
        endCounting: function () {
            'use strict';
            log(arguments);
        },
        reportEvent: function () {
            'use strict';
            log(arguments);
        },
        exCall: function () {
            'use strict';
            log(arguments);
        }
    };

cm8js.VER = function VER(videoplayer, componentName) {

    'use strict';

    var video = videoplayer.video,
    	isMouseDown = false,
    	isFireSeek = false;

    this.stop = function stop() {
        onStop();
    };

    function onStart() {
        log('START COUNT: video_start');
        CM8ER.startCounting(componentName, 'video_start', 'video_start_time', 'gc', true);
//        CM8ER.reportInteraction(componentName);
    }

    function onPlay() {
        log('REPORT EVENT: video_resume');
        log('START COUNT: video_start');
        CM8ER.reportEvent(componentName, 'video_resume', 1, false, 'gc', false);
        CM8ER.startCounting(componentName, 'video_start', 'video_start_time', 'gc', true);
        CM8ER.reportInteraction(componentName);
    }

    function onPause() {
        log('REPORT EVENT: video_pause');
        log('END COUNT: video_start');
        CM8ER.reportEvent(componentName, 'video_pause', 1, false, 'gc', false);
        CM8ER.endCounting(componentName, 'video_start', 'video_start_time');
        CM8ER.reportInteraction(componentName);
    }

    function onMute() {
        log('REPORT EVENT: video_mute');
        CM8ER.reportEvent(componentName, 'video_mute', 1, false, 'gc', false);
        CM8ER.reportInteraction(componentName);
    }

    function onUnMute() {
        log('REPORT EVENT: video_unmute');
        CM8ER.reportEvent(componentName, 'video_unmute', 1, false, 'gc', false);
        CM8ER.reportInteraction(componentName);
    }

    function onFullScreenEnter() {
        log('REPORT EVENT: video_fullscreen');
        CM8ER.reportEvent(componentName, 'video_fullscreen', 1, false, 'gc', false);
        CM8ER.reportInteraction(componentName);
    }

    function onFullScreenExit() {
        log('REPORT EVENT: video_exit_fullscreen');
        CM8ER.reportEvent(componentName, 'video_exit_fullscreen', 1, false, 'gc', false);
        CM8ER.reportInteraction(componentName);
    }

    function onQuartile() {
        log('REPORT EVENT: video_first_quartile');
        CM8ER.reportEvent(componentName, 'video_first_quartile', 1, false, 'gc', false);
    }

    function onMid() {
        log('REPORT EVENT: video_mid');
        CM8ER.reportEvent(componentName, 'video_mid', 1, false, 'gc', false);
    }

    function onThird() {
        log('REPORT EVENT: video_third_quartile');
        CM8ER.reportEvent(componentName, 'video_third_quartile', 1, false, 'gc', false);
    }

    function onEnd() {
        log('REPORT EVENT: video_end');
        log('END COUNT: video_start');
        CM8ER.reportEvent(componentName, 'video_end', 1, false, 'gc', false);
        CM8ER.endCounting(componentName, 'video_start', 'video_start_time');
    }

    function onSeek() {
    	//log('REPORT EVENT: video_seek_before');
    	if (!isMouseDown) {
    		log('REPORT EVENT: video_seek');
            CM8ER.reportEvent(componentName, 'video_seek', 1, false, 'gc', false);
            CM8ER.reportInteraction(componentName);
    	} else {
    		isFireSeek = true;
    	}
    }

    function onStop() {
        log('REPORT EVENT: video_stop');
        log('END COUNT: video_start');
        CM8ER.reportEvent(componentName, 'video_stop', 1, false, 'gc', false);
        CM8ER.endCounting(componentName, 'video_start', 'video_start_time');
        CM8ER.reportInteraction(componentName);
    }

    function onReplay() {
        log('REPORT EVENT: video_replay');
        CM8ER.reportEvent(componentName, 'video_replay', 1, false, 'gc', false);
        CM8ER.reportInteraction(componentName);
    }

    function onError() {
        log('onerror');
        //an error in playing the video
    }

    function onClick() {
        //video is clicked
    }
    
    function onMouseDown() {
    	isMouseDown = true;
    }
    
    function onMouseUp() {
    	isMouseDown = false;
    	if (isFireSeek) {
    		isFireSeek = false;
    		onSeek();
    	}
    }

    //custom events for CM8 Event Reporter
    video.on('video-start', onStart);
    video.on('video-play', onPlay);
    video.on('video-pause', onPause);
    video.on('video-mute', onMute);
    video.on('video-unmute', onUnMute);
    video.on('video-end', onEnd);
    video.on('video-fullscreen-enter', onFullScreenEnter);
    video.on('video-fullscreen-exit', onFullScreenExit);
    video.on('video-quart', onQuartile);
    video.on('video-mid', onMid);
    video.on('video-third', onThird);
    video.on('video-seek', onSeek);
    video.on('video-click', onClick);
    video.on('video-error', onError);
    video.on('video-stop', onStop);
    video.on('video-replay', onReplay);
    
    document.onmousedown = onMouseDown;
    document.onmouseup   = onMouseUp;

    //log(CM8ER);
    //log("VideoEventReporter for '" + videoplayer.getVideoId() + "' initialized...");

};
