fullon.views.register.allegiance = Backbone.View.extend({

    initialize: function() {
        this.$section = $('#allegiance');
        this.$camper_types = $('input:radio[name=camper_type]');
        this.$camper_type_labels = $('.camper_type_label');
        this.$camper_type_flags = $('.camper_type_flag');
        this.$navigation_button_container = $('#allegiance_navigation_container', '#allegiance');
        this.$camper_type_row = $('#camper_type_row', '#allegiance');

        // attach events
        var self = this;
        $('.allegiance-btn').on('click', function(event) {
            event.stopPropagation();
            self.allegiance_toggle($(this).attr('data-id'));
        });

        // turn on flags: we are now ready
        this.$camper_type_row.removeClass('invisible');
    },

    constants: {
        flag: (function() {
            var prefix = 'camper_type_flag_';

            return {
                prefix: prefix,
                regex: new RegExp('^' + prefix)
            };
        })()
    },

    allegiance_toggle: function(camper_type) {
        // TODO: 1. warn user if changing type and answers have been filled in

        var self = this;
        fullon.state.camper_type = camper_type;

        // 1. update form
        console.log('selecting camper type: ', fullon.state.camper_type);
        this.$camper_types.each(function() {
            $(this).prop('checked', false);
        });

        this.$camper_types.filter('[value=' + fullon.state.camper_type + ']').prop('checked', true);

        // 2. update labels
        this.$camper_type_labels.text(fullon.state.camper_type);

        // 3. enable prev/next buttons
        // disabled: now just navigation straight away
        // having the buttons appear was not intuitive for mobile
        //this.$navigation_button_container.removeClass('invisible');

        fullon.vent.trigger('camper_type:change');

        // 5. can now navigate to the next page
        fullon.vent.trigger('navigate:next', this.$section);

    }

});

