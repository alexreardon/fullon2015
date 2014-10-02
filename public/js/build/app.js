// namespaces
window.fullon = {};
fullon.views = {};
fullon.state = {};

// events
fullon.vent = {};
_.extend(fullon.vent, Backbone.Events);

// modules
//fullon.validation = require('../../util/validation');

fullon.views.feature_detect = Backbone.View.extend({
    initialize: function() {
        this.$modal = $('.upgrade-modal');

    },
    isBrowserSupported: function() {

        // media queries
        if (!Modernizr.mq('only all')) {
            return false;
        }

        var minimum_features = [
            'backgroundsize',
            'opacity',
            'cssanimations',
            'generatedcontent',
            'cssgradients',
            'csstransitions',
            'csstransforms'
        ];

        return _.every(minimum_features, function(feature) {
            return Modernizr[feature] === true;
        });
    },
    showUpgradeBrowserModal: function() {
        // modal is uncloseable!
        this.$modal.modal({
            keyboard: false,
            backdrop: 'static'
        });
    }
});

fullon.views.common = Backbone.View.extend({

    initialize: function() {
        this.$full_screen = $('.l-full-screen');
        this.$nav = $('.nav-bar');

        this.throttled_resize = _.debounce(this.resize, 100);

        this.resize();

        $(window).on('resize', function() {
            this.throttled_resize();
        }.bind(this));

    },

    resize: function() {
        // crappy iOS doesn't like 100vh; Need to set the height manually
        console.log('window resize - common');

        var height = this.get_min_height();
        this.$full_screen.css('min-height', height);

    },

    get_min_height: function() {
        return ($(window).height() - this.$nav.height());
    }
});

(function() {
    var feature_detector = new fullon.views.feature_detect();

    if (!feature_detector.isBrowserSupported()) {
        console.warn('browser not supported');
        return feature_detector.showUpgradeBrowserModal();
    }

    console.log('browser supported, lets do this!');
    var common = new fullon.views.common();
})();



(function(exports) {

    var regex = {
        email: /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/,
        number: /^\d+$/,
        letters: /^[a-zA-Z]+[a-zA-Z\s'-]*$/,
        date: /^[\d]{2}\/[\d]{2}\/[\d]{4}$/, // DD/MM/YYYY
        money: /^[\d,]+?$/ // 111,000,00
    };

    var rules = {
        min_length: {
            fn: function(input, length) {
                return (input && input.length && input.length >= length) || false;
            },
            text: 'must be at least {0} characters in length'
        },
        max_length: {
            fn: function(input, length) {
                return (input && input.length && input.length <= length) || false;
            },
            text: 'cannot be longer then {0} characters'
        },
        required: {
            fn: function(input) {
                return (input && input.length && input.length > 0) || false;
            },
            text: 'this is a required field'
        },
        is_letters: {
            fn: function(input) {
                return regex.letters.test(input);
            },
            text: 'must be letters only'
        },
        is_numbers: {
            fn: function(input) {
                return regex.number.test(input);
            },
            text: 'must be numbers only'
        },
        is_email: {
            fn: function(input) {
                return regex.email.test(input);
            },
            text: 'must be in email format (eg \'example@email.com\')'
        },
        is_date: {
            fn: function(input) {
                return regex.date.test(input);
            },
            text: 'date is expected the format: DD/MM/YYYY'
        },
        is_money: {
            fn: function(input) {
                return regex.money.test(input);
            },
            text: 'money is expected in the format: 10 or 10,000 or 10000 (no \'$\' or decimal points)'
        },
        value: {
            fn: function(input, value) {
                return (input === value);
            },
            text: 'value must be \'{0}\''
        }
    };

    if (typeof module !== 'undefined') {
        // module pattern
        module.exports = exports = rules;
        return;
    }

    if (typeof window !== 'undefined' && window.fullon) {
        window.fullon.validation = rules;
    }

})();





fullon.views.index = Backbone.View.extend({

    initialize: function() {
        this.$nav_bar = $('.fo-navbar');
        this.$landing = $('.landing');
        this.$landing_video = $('.landing-video');
        this.landing_video = this.$landing_video[0];

        this.$trailer_video_launch = $('.trailer-video-launch');
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

        this.$landing[method]('is-trailer-playing');

        // hide navbar
        this.$nav_bar[method]('is-trailer-playing');


        if (show) {
            this.$trailer_video_launch.attr('disabled', 'disabled');
            this.$f_trailer_video_iframe.api('play');
        } else {
            this.$trailer_video_launch.removeAttr('disabled');
            this.$f_trailer_video_iframe.api('unload');
        }
    }
});

(function() {
    var index = new fullon.views.index();
})();