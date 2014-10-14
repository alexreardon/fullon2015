var config = require('../config'),
    date = require('../util/date'),
    iCalEvent = require('icalevent');

var times = date.get_ical_data(),
    event = new iCalEvent({
        uid: config.google_username,
        offset: new Date().getTimezoneOffset(),
        start: times.start,
        end: times.end,
        timezone: config.tz,
        summary: 'FullOn',
        description: 'St Philips Eastwood Anglican Church: Annual Youth Camp',
        location: 'St Philips Eastwood Anglican Church',
        url: 'http://fullon.stphils.org.au'
    }),
    eventString = event.toFile(),
    filename = 'fullon.ics';

exports.routes = function(app) {
    app.get('/cal/' + filename, function(req, res, next) {

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', 'text/calendar; charset=utf-8');
        res.charset = 'UTF-8';
        res.write(eventString);
        res.end();
    });
};
