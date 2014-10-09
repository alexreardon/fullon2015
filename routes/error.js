var email = require('../util/email'),
    config = require('../config');

exports.routes = function(app) {

    // Route not found (404)
    app.use(function(req, res) {
        console.log('ROUTE NOT FOUND');
        res.status(404);
        if (req.xhr) {
            return res.json({ 404: 'page not found'});
        }
        res.render('404', { url: req.url });
    });

    // Error Logging
    app.use(function(err, req, res, next) {
        console.error(err);
        next(err);
    });

    // Server errors (500)
    app.use(function(err, req, res, next) {
        try {
            email.send_error_email(err);
        } catch(ex) {
            console.error('unable to send error email for', err, ex);
        }

        res.status(500);
        if (req.xhr) {
            return res.json({ 500: 'server error'});
        }
        res.render('500', { error: err, env: process.env.NODE_ENV || 'development' });
    });
};
