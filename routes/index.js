var app = require('../app'),
	_ = require('underscore'),
	date = require('../util/date'),
	person = require('../models/person'),
	config = require('../config');

var scripts = ['/public/js/pages/index.js'];

app.get('/', function (req, res, next) {

	//(query, cb, limit, sort)
	//find all people with sold > 0, limit: 10, in decending order of amount sold
	person.get_leaderboard(function (err, leaderboard) {
		if (err) {
			next(new Error(err));
			return;
		}

		// data:
		var data = {
			days_to_camp: date.get_days_until(config.application.date_camp_start),
			days_to_earlybird_end: date.get_days_until(config.application.date_earlybird_end)
		};

		data.is_camp_open = (data.days_to_camp >= 0);
		data.is_earlybird_open = (data.days_to_earlybird_end >= 0);

		res.render('index', {
			people: leaderboard.people,
			stats: leaderboard.stats,
			config: config.application,
			data: data,
			scripts: scripts
		});
	});
});