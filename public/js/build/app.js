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

    onTrailerVideoReady: function(player_id) {
        console.log('trailer is ready to be played', player_id);
        this.$trailer_video_launch.addClass('is-ready');

        $f(player_id).api('play');
    },

    onLandingVideoReady: function() {
        this.$landing_video.addClass('is-ready');
        console.log('playing video');
        this.landing_video.play();
    },

    showTrailer: function() {
        console.log('modal opens');
        this.$landing_video.addClass('is-trailer-playing');
        this.$landing_logo.addClass('is-trailer-playing');

        // turn off the button
        this.$trailer_video_launch
            .attr('disabled', 'disabled')
            .addClass('is-trailer-playing');

        // play the video
        this.$trailer_video.addClass('is-trailer-playing');
        this.$f_trailer_video_iframe.api('play');

    }
});

(function() {
    var index = new fullon.views.index();
})();