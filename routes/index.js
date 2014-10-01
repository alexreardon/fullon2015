var _ = require('underscore'),
    date = require('../util/date'),
    person = require('../models/person'),
    config = require('../config');

var scripts = ['/public/js/pages/index.js'];

exports.routes = function(app) {
    app.get('/', function(req, res, next) {

        // coming soon
        return res.render('index', {
            config: config.application,
            data: date.get_page_data(),
        });
    });
};
