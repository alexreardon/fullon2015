var spreadsheet = require('../jobs/spreadsheet'),
    report = require('../jobs/report'),
    config = require('../config'),
    moment = require('moment'),
    format = require('util').format,
    basicAuth = require('basic-auth');

function unathorised(req, res) {
    res.status(401);
    res.set('WWW-Authenticate', 'Basic realm="Password required for FullOn resource"');
    res.end('unathorised');
}

function auth(req, res, next) {
    var user = basicAuth(req);

//    console.log('USER', user, config.job_username, config.job_password);
    if (!user || !user.name || !user.pass) {
        return unathorised(req, res);
    }

    if (user.name !== config.job_username || user.pass !== config.job_password) {
        return unathorised(req, res);
    }

    return next();
}

function create_filename() {
    return format('registrations--%s.csv', moment().format(config.application.date_format_file));
}

exports.routes = function(app) {
    app.get('/jobs/getspreadsheet', auth, function(req, res, next) {
        spreadsheet.run(function(err) {
            if (err) {
                return next(new Error(err));
            }
            res.send('success');
        });
    });

    app.get('/jobs/report', auth, function(req, res, next) {
        report.run(function(err, csv) {
            if (err) {
                return next(new Error(err));
            }

            res.attachment(create_filename());
            res.end(csv, 'UTF-8');
        });
    });
};

