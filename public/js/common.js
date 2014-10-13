// namespaces
window.fullon = {
    views: {
        register: {}
    },
    state: {},
    routers: {},
    vent: _.extend({}, Backbone.Events)
};

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

        $('.datepicker').datepicker({
            format: 'dd/mm/yyyy',
            autoclose: true
        });

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


