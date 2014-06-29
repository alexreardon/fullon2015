var moment = require('moment'),
    _ = require('underscore'),
    config = require('../config');

// morning, late-morning, afternoon, late-afternoon, evening, night, late-night
var time_periods = {
    'morning': [5, 6, 7, 8, 9],
    'late-morning': [10, 11, 12],
    'afternoon': [13, 14],
    'late-afternoon': [15, 16, 17],
    'evening': [18, 19, 20],
    'late-night': [21, 22, 23, 0, 1, 2, 3, 4]
};

exports.get_days_until = function (end_date) {

    var now = moment(),
        end = moment(end_date, config.application.date_format_short);

    return end.diff(now, 'days');
};

exports.get_page_data = function () {
    var data = {
        days_to_camp: exports.get_days_until(config.application.date_camp_start),
        days_to_earlybird_end: exports.get_days_until(config.application.date_earlybird_end),
        days_to_registration_close: exports.get_days_until(config.application.date_register_end)
    };

    data.is_camp_open = (data.days_to_camp >= 0);
    data.is_earlybird_open = (data.days_to_earlybird_end >= 0);
    data.is_registration_open = (data.days_to_registration_close >= 0);

    return data;
};

exports.get_current_time_period = function (hour) {
    var now = moment(),
        current_hour = hour || now.hour();

    var result;
    _.each(time_periods, function (item, key) {
        if (_.contains(item, current_hour)) {
            result = key;
        }
    });

    return result;
};