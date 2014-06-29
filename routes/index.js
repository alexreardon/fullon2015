var _ = require('underscore'),
	date = require('../util/date'),
	person = require('../models/person'),
	config = require('../config');

var scripts = ['/public/js/pages/index.js'];

exports.routes = function(app){
    app.get('/', function (req, res, next) {

        // coming soon
        return res.render('coming_soon', {
            data: date.get_page_data(),
            time_period: date.get_current_time_period()
        });

		//(query, cb, limit, sort)
		//find all people with sold > 0, limit: 10, in decending order of amount sold
		person.get_leaderboard(function (err, leaderboard) {
			if (err) {
                return next(new Error(err));
			}

			res.render('index', {
				people: leaderboard.people,
				stats: leaderboard.stats,
				config: config.application,
				data: date.get_page_data(),
				scripts: scripts
			});
		});
	});
};
