// namespaces
window.fullon = {};
fullon.views = {};
fullon.state = {};

// events
fullon.vent = {};
_.extend(fullon.vent, Backbone.Events);

// modules
//fullon.validation = require('../../util/validation');



fullon.views.index = Backbone.View.extend({

    initialize: function() {
        this.$nav_bar = $('.landing-navbar');
        this.$landing_video = $('.landing-video');
        this.landing_video = this.$landing_video[0];
        this.$trailer_video_launch = $('.trailer-video-launch');
        this.$landing_logo = $('.landing-logo');

        this.$trailer_video = $('#trailer-video');
        this.$f_trailer_video_iframe = $f(this.$trailer_video[0]);

        this.$f_trailer_video_iframe.addEvent('ready', function(player_id) {
            this.onTrailerVideoReady(player_id);
        }.bind(this));


        this.$trailer_video_launch.on('click', function(event) {
            this.showTrailer();
        }.bind(this));

        this.landing_video.oncanplay = function() {
            this.onLandingVideoReady();
        }.bind(this);

    },



    onLandingVideoReady: function() {

        // update ui
        this.$landing_video.addClass('is-ready');
        this.landing_video.play();
        console.log('playing video');
    },

    showTrailer: function() {
        console.log('show trailer');
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

    setTrailerMode: function(show) {
        var method = show ? 'addClass' : 'removeClass';

        this.$landing_video[method]('is-trailer-playing');
        this.$landing_logo[method]('is-trailer-playing');
        console.log('adding method to video launch', method, this.$trailer_video_launch);

        this.$nav_bar[method]('is-trailer-playing');
        // turn off the button
        this.$trailer_video_launch[method]('is-trailer-playing');
        if (show) {
            this.$trailer_video_launch.attr('disabled', 'disabled');
        } else {
            this.$trailer_video_launch.removeAttr('disabled');
        }

        // play the video
        this.$trailer_video[method]('is-trailer-playing');

        if (show) {
            this.$f_trailer_video_iframe.api('play');
        } else {
            this.$f_trailer_video_iframe.api('unload');
        }
    }
});

(function() {
    var index = new fullon.views.index();
})();