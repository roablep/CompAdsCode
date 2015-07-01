/**
http://ch2lb.checkm8.com/data/static/video-player_June_2015.js
 * Uses video.js to implement video player functionality
 * that works across browser with flash fallback
 */

var cm8js = window.cm8js,
    vjs = window._V_ || window.videojs;

cm8js.VideoPlayer = function VideoPlayer() {
    "use strict";

    //private
    var that = this, el, elVideo, videoId, videoIsEnded = false, quartReached = false,
        midReached = false, thirdReached = false, endReached = false, isEnding = false, isStopping = false,
        isReplaying = false, isSeeking = false, isVideoInit = true, isFirstPlay = true, firstPlayTriggered = false,
        suppressVolumeChangeEvent = false, isFullScreen = false;

    function buildVideoElement(o) {
        el = document.getElementById(o.container);
        videoId = o.videoId;
        var attr = {};
        attr.id = videoId;
        attr.className = 'video-js vjs-default-skin vjs-big-play-centered';

        if (o.poster && o.poster !== '') {
            attr.poster = o.poster;
        }

        elVideo = cm8js.createEl('video', attr);
        el.appendChild(elVideo);
    }

    function buildStopPlugin() {
        var props = {
            className: 'vjs-stop-button vjs-control',
            innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">' + ('Stop') + '</span></div>',
            role: 'button',
            'aria-live': 'polite',
            tabIndex: 0
        };

        //video stop plugin
        vjs.Stop = vjs.Button.extend({
            init: function (player, options) {
                vjs.Button.call(this, player, options);
                this.on('click', this.onStop);
            }
        });

        vjs.Stop.prototype.onStop = function onStop() {
            this.player().trigger('stop');
            this.player().currentTime(0);
            this.player().pause();
        };

        vjs.plugin('stop', function () {
            var options = {
                    'el': vjs.Component.prototype.createEl(null, props)
                },
                stop = new vjs.Stop(this, options);
            this.controlBar.el().appendChild(stop.el());
        });
    }

    function buildBigReplayPlugin() {
        var props = {
            className: 'vjs-big-replay-button',
            innerHTML: '<span aria-hidden="true"></span>',
            'aria-label': 'replay video',
            role: 'button',
            'aria-live': 'polite',
            tabIndex: 0
        };

        //video big replay plugin (to display on top at the end of video)
        vjs.BigReplay = vjs.Button.extend({
            init: function (player, options) {
                vjs.Button.call(this, player, options);
                this.on('click', this.onReplay);
                this.player().on('ended', this.showReplay);
            }
        });

        vjs.BigReplay.prototype.onReplay = function onReplay() {
            this.player().trigger('replay');
            this.player().currentTime(0);
            this.player().play();
            this.player().removeClass('vjs-has-ended');
        };

        vjs.BigReplay.prototype.showReplay = function showReplay() {
            this.player().addClass('vjs-has-ended');
        };

        vjs.plugin('bigreplay', function () {
            var options = {
                    'el': vjs.Component.prototype.createEl(null, props)
                },
                bigreplay = new vjs.BigReplay(this, options);

            this.el().appendChild(bigreplay.el());
        });
    }

    function buildReplayPlugin() {
        var props = {
            className: 'vjs-replay-button vjs-control',
            innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">' + ('Replay') + '</span></div>',
            role: 'button',
            'aria-live': 'polite',
            tabIndex: 0
        };

        //video replay plugin
        vjs.ReplayButton = vjs.Button.extend({
            init: function (player, options) {
                vjs.Button.call(this, player, options);
                this.on('click', this.onReplay);
                this.player().on('ended', this.showReplay);
            }
        });

        vjs.plugin('replay', function () {
            var options = {
                    'el': vjs.Component.prototype.createEl(null, props)
                },
                replay = new vjs.ReplayButton(this, options);

            this.controlBar.el().appendChild(replay.el());
        });

        vjs.ReplayButton.prototype.onReplay = function onReplay() {
            this.player().trigger('replay');
            this.player().currentTime(0);
            this.player().play();
            this.player().removeClass('vjs-has-ended');
        };

        vjs.ReplayButton.prototype.showReplay = function showReplay() {
            this.player().addClass('vjs-has-ended');
        };
    }

    // Videojs Event Handlers

    function onPlay() {
        if (isFirstPlay  && !firstPlayTriggered) {
            firstPlayTriggered = true;
            that.video.trigger('video-first-play');
        }
        isStopping = false;
        if (isSeeking) {
            isSeeking = false;
            return;
        }
        if (isReplaying) {
            isReplaying = false;
            return;
        }
        videoIsEnded = false;

        if (that.video.currentTime() === 0) {
            //fire start
            that.video.trigger('video-start');
        } else {
            //fire resume
            that.video.trigger('video-play');
        }
    }

    function onPause() {
        if (isStopping || isSeeking || isEnding || endReached) {
            return;
        }
        that.video.trigger('video-pause');
    }

    function onEnd() {
        isEnding = true;
        videoIsEnded = true;
        isFirstPlay = false;
        that.video.trigger('video-end');
    }

    function onFullScreenChange() {
        if (isFullScreen) {
            isFullScreen = false;
            that.video.trigger('video-fullscreen-exit');
        } else {
            isFullScreen = true;
            that.video.trigger('video-fullscreen-enter');
        }
    }

    function onTimeUpdate() {
        var currentPercentage = Math.round((that.video.currentTime() / that.video.duration()) * 100);
        if (currentPercentage >= 25 && !quartReached) {
            quartReached = true;
            that.video.trigger('video-quart');
        } else if (currentPercentage >= 50 && !midReached) {
            midReached = true;
            that.video.trigger('video-mid');
        } else if (currentPercentage >= 75 && !thirdReached) {
            thirdReached = true;
            that.video.trigger('video-third');
        } else if (currentPercentage >= 100 && !endReached) {
            endReached = true;
        }
    }

    function onVolumeChange() {
        if (suppressVolumeChangeEvent) {
            suppressVolumeChangeEvent = false;
            return;
        }

        //first play, muted at start should rewind
        if (isFirstPlay && that.initMute) {
            that.initMute = false;
            that.reset();
            that.video.volume(1);
            that.video.currentTime(0);
            that.video.trigger('video-unmute');
        } else {
            if (that.video.muted()) {
                that.video.trigger('video-mute');
            } else {
                that.video.volume(1);
                that.video.trigger('video-unmute');
            }
        }
    }

    function onSeek() {
        if (isStopping || isReplaying) {
            return;
        }

        if (isFirstPlay) {
            isFirstPlay = false;
            return;
        }

        isSeeking = true;

        //when user seeks after the video has ended, play the video
        if (videoIsEnded) {
            videoIsEnded = false;
            that.video.play();
            that.video.removeClass('vjs-has-ended');
        }

        that.video.trigger('video-seek');

        //user seeked after video ended
        if (endReached) {
            that.reset();
        }
    }
    
    function onSeeking() {
    	isSeeking = true;
    }

    function onStop() {
        isStopping = true;
        that.video.trigger('video-stop');
    }

    function onReplay() {
        isReplaying = true;
        videoIsEnded = false;
        that.reset();
        that.video.trigger('video-replay');
    }

    function onError() {
        that.video.trigger('video-error');
    }

    function onVideoClick() {
        //only fire clickthrough while video is playing
        if (!videoIsEnded && that.click && that.click !== '') {
            window.open(that.click, '_blank');
        }
    }

    function onVideoCanPlay() {
        //hacking: explicitly set mute to true to force mute icon to mute state
        //otherwise videojs will mute the video but not show correct
        //mute toggle state
        if (that.initMute) {
            that.video.muted(true);
        }
    }

    //privileged-public
    this.duration = 0;
    this.el = null;
    this.initMute = false;
    this.video = null;
    this.clickThrough = '';
    this.VIDEO_ERROR = {
        ERROR: 'error',
        EMPTY: 'empty',
        UNSUPPORTED: 'unsupported'
    };

    this.getVideoId = function getVideoId() {
        return videoId;
    };

    this.initialize = function initialize(options, onSuccess, onFail) {

        var i,
            media = options.media,
            len = media.length,
            canPlayHtml5 = false,
            canPlayFlash = false;

        this.el = el;
        this.click = options.click;
        videoId = options.videoId;

        //check if we can play any of the media files provided
        if (len > 0) {
            for (i = 0; i < len; i += 1) {
                if (vjs.Html5.canPlaySource(media[i])) {
                    log('Found a media that HTML5 can play!');
                    canPlayHtml5 = true;
                    break;
                }
                if (vjs.Flash.canPlaySource(media[i])) {
                    log('Found a media that Flash can play!');
                    canPlayFlash = true;
                }
            }
        } else {
            onFail({type: this.VIDEO_ERROR.EMPTY});
            return;
        }

        if (!canPlayHtml5 && !canPlayFlash) {
           onFail({type: this.VIDEO_ERROR.UNSUPPORTED});
           return;
        }

        //build video elements
        buildVideoElement(options);

        //build plugins
        buildStopPlugin();
        buildBigReplayPlugin();
        buildReplayPlugin();


        this.initMute = options.muted;
        //workaround of a bug in videojs where
        //initial mute does not toggle the mute
        //icon to mute state so we explicitly
        //set the mute state by calling mute method
        //at start but we don't want to react to
        //that volume change event
        if (this.initMute) {
            suppressVolumeChangeEvent = true;
        }

        //by default only support html5 videos
        options.techOrder = ['html5', 'flash'];

        this.video = vjs(videoId, {
            'autoplay': false,
            'techOrder': options.techOrder,
            //'muted': options.muted,
            'preload': options.preload,
            'width': options.width,
            'height': options.height,
            'controls': options.controls,
            'plugins': {
                replay: {},
                stop: {},
                bigreplay: {}
            }
        });

        //add events
        this.video.on('play', onPlay);
        this.video.on('pause', onPause);
        this.video.on('fullscreenchange', onFullScreenChange);
        this.video.on('timeupdate', onTimeUpdate);
        this.video.on('volumechange', onVolumeChange);
        this.video.on('ended', onEnd);
        this.video.on('seeked', onSeek);
        this.video.on('seeking', onSeeking);
        this.video.on('stop', onStop);
        this.video.on('error', onError);

        //if there is an error playing, inform callback
        if (onFail) {
            this.video.on('error', onFail, {type: 'video-play-error'});
        }

        //video-click event is added to videojs to react to
        //a click on the video view area (not including the controls bar)
        //this helps fire clickthrough urls (works only when controls are on)
        this.video.on('video-click', onVideoClick);

        //when controls are removed, click which is
        //considered a control is also removed
        //so for clickthrough url we add a click on
        //the entire video
        if (!options.controls) {
            log('no controls...');
            this.video.on('click', onVideoClick);
        }

        //video canplay is fired when enough of video is downloaded
        //right before the video starts playing
        this.video.on('canplay', onVideoCanPlay);

        this.video.ready(function () {
            log('video is ready...');
            this.src(options.media);
            if (onSuccess) {
                onSuccess();
            }
            log("VideoPlayer '" + that.getVideoId() + "' initialized.");
        });
    };

    this.reset = function reset() {
        quartReached = false;
        midReached = false;
        thirdReached = false;
        endReached = false;
        isEnding = false;
    };

};

//public api
cm8js.VideoPlayer.prototype.play = function play() {
    'use strict';
    log('playing...');
    this.video.play();
};

cm8js.VideoPlayer.prototype.stop = function stop() {
    'use strict';
    this.video.stop();
};

cm8js.VideoPlayer.prototype.replay = function play() {
    'use strict';
    this.video.trigger('replay');
    this.video.currentTime(0);
    this.video.play();
    this.video.removeClass('vjs-has-ended');
};

cm8js.VideoPlayer.prototype.pause = function stop() {
    'use strict';
    this.video.pause();
};

cm8js.VideoPlayer.prototype.dispose = function dispose() {
    "use strict";
    if (this.video) {
        this.video.dispose();
    }
};

cm8js.VideoPlayer.prototype.mute = function mute() {
    "use strict";
    this.video.muted(true);
    this.video.trigger('video-mute');
};

cm8js.VideoPlayer.prototype.unmute = function unmute() {
    "use strict";
    this.video.muted(false);
    this.video.trigger('video-unmute');
};

cm8js.VideoPlayer.prototype.isPaused = function isPaused() {
    "use strict";
    return this.video.paused();
}

//reference of additinal  vjs events not being used
/*
 video.on('seeked', onSeeked);
 video.on('durationchange', onDurationChange);
 video.on('firsplay', onFirstPlay);
 video.on('loadeddata', onLoadedData);
 video.on('loadedmetadata', onLoadedMetadata);
 video.on('loadstart', onLoadStart);
 video.on('progress', onProgress);
 video.on('resize', onResize);
 video.on('loadedalldata', onLoadedAllData);
 */
