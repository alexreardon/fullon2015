// namespaces
window.fullon = {};
fullon.views = {};
fullon.state = {};

// events
fullon.vent = {};
_.extend(fullon.vent, Backbone.Events);

// modules
//fullon.validation = require('../../util/validation');

fullon.views.common = Backbone.View.extend({

    initialize: function() {
        this.$full_screen = $('.l-full-screen');
        this.$nav = $('.nav-bar');

        this.throttled_resize = _.debounce(this.resize, 100);

        this.resize();

        $(window).on('resize', function () {
            this.throttled_resize();
        }.bind(this));


    },

    resize: function () {
        // crappy iOS doesn't like 100vh; Need to set the height manually
        console.log('window resize - common');

        var height = this.get_min_height();
        this.$full_screen.css('min-height', height);

    },

    get_min_height: function () {
        return ($(window).height() - this.$nav.height());
    }
});

(function() {
    var common = new fullon.views.common();
})();


