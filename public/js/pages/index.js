fullon.views.index = Backbone.View.extend({

    initialize: function() {
        this.transEndEventName = fullon.views.feature_detect.TRANS_END_EVENT_NAME;

        this.$nav_bar = $('.fo-navbar');
        this.$landing = $('.landing');
        //this.$landing_video = $('.landing-video');
        //this.landing_video = this.$landing_video[0];

        this.$trailer_video_launch = $('.trailer-video-launch');
        this.$trailer_video = $('#trailer-video');
        this.$f_trailer_video_iframe = $f(this.$trailer_video[0]);
        this.$trailer_video_close = $('.trailer-video-close');

        this.$f_trailer_video_iframe.addEvent('ready', function(player_id) {
            this.onTrailerVideoReady(player_id);
        }.bind(this));

        this.$trailer_video_launch.on('click', function(event) {
            this.showTrailer();
        }.bind(this));

        //this.landing_video.oncanplay = function() {
        //    this.onLandingVideoReady();
        //}.bind(this);

        this.$trailer_video_close.on('click', function() {
            this.stopTrailer();
        }.bind(this));

    },

    //onLandingVideoReady: function() {
    //
    //    // update ui
    //    this.$landing_video.removeClass('hide').addClass('show');
    //    this.landing_video.play();
    //    console.log('playing video');
    //},

    showTrailer: function() {
        if(this.$landing.hasClass('is-trailer-playing')) {
            return console.log('not playing trailer as it is already playing');
        }

        this.setTrailerMode(true);
    },

    onTrailerVideoReady: function(player_id) {
        // bind events
        this.$f_trailer_video_iframe.addEvent('finish', this.onTrailerFinished.bind(this));
        this.$f_trailer_video_iframe.addEvent('pause', this.onTrailerPaused.bind(this));
        this.$f_trailer_video_iframe.addEvent('play', this.onTrailerPlayed.bind(this));

        // show the button
        this.$trailer_video_launch.addClass('is-ready');
        console.log('trailer is ready to be played', player_id);
    },

    onTrailerFinished: function() {
        console.log('trailer finished');
        this.setTrailerMode(false);
//        this.$f_trailer_video_iframe.api('unload');
    },

    onTrailerPaused: function() {
        this.$nav_bar.removeClass('is-trailer-playing');
        console.log('trailer paused');
    },

    onTrailerPlayed: function() {
        this.$nav_bar.addClass('is-trailer-playing');
        console.log('trailer played');
    },

    stopTrailer: function() {
        this.setTrailerMode(false);
    },

    setTrailerMode: function(show) {
        var method = show ? 'addClass' : 'removeClass';

        this.$landing[method]('is-trailer-playing');

        // hide navbar
        this.$nav_bar[method]('is-trailer-playing');

        if (this.transEndEventName) {
            if (!show) {
                this.$trailer_video_close.one(this.transEndEventName, function() {
                    $(this).addClass('hide');
                });
            } else {
                this.$trailer_video_close.removeClass('hide');
            }
        }

        if (show) {
            this.$trailer_video_launch.attr('disabled', 'disabled');
            this.$f_trailer_video_iframe.api('play');
        } else {
            this.$trailer_video_launch.removeAttr('disabled');
            this.$f_trailer_video_iframe.api('unload');
        }
    }
});