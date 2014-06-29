var date = require('../../util/date'),
    config = require('../../config'),
    moment = require('moment'),
    expect = require('expect.js');

describe('Date - Days until', function () {

    it('should get days until', function () {
        var now = moment();
        var future_date = '01.01.2100';
        var future_moment = moment(future_date, config.application.date_format_short);
        var days = date.get_days_until(future_date);

        // warning: might fail if executed right on midnight: moment in get_days_until will be different to this moment
        expect(future_moment.diff(now, 'days')).to.be(days);
    });

});

describe('Date - get time of day period', function () {
    it('should get a result for every hours', function () {
        for (var hour = 0; hour < 23; hour++) {
            expect(date.get_current_time_period(hour)).to.be.ok();
        }
    });
    it('should use the current hour to get the correct period', function () {
        var now = moment(),
            current_hour = now.hour();

        var no_args_result = date.get_current_time_period(),
            args_result = date.get_current_time_period(current_hour);

        expect(no_args_result).to.eql(args_result);
    });
});