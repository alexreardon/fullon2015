var
// express components
    express = require('express'),
    compression = require('compression'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    app = express(),

// other
    config = require('./config'),
    _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    format = require('util').format,
    hbs = require('hbs'),
    helpers = require('./views/helpers'),
    locals = require('./util/locals');

// Views
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

// Register helpers
_.each(helpers, function (val, key) {
    hbs.registerHelper(key, val);
});

// Middleware - Express
app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.urlencoded());
//app.use(bodyParser.json());
//app.use(methodOverride());
//app.use(cookieParser(config.cookie_secret));
app.use(session({secret: config.session_secret}));

// Static file serving
app.use('/public', express.static(path.join(__dirname, '/public')));

// Bootstrap data
app.locals.bootstrap = JSON.stringify(locals.bootstrap);

// Load in routes
_.each(fs.readdirSync('./routes'), function (file) {
    require('./routes/' + file).routes(app);
});

// Error logging
app.use(function (err, req, res, next) {
    console.error(err);
    next(err);
});

// Route not found (404)
app.use(function (req, res) {
    console.log('ROUTE NOT FOUND');
    res.status(404);
    res.render('404', { url: req.url });
});

// Server errors (500)
app.use(function (err, req, res, next) {
    res.status(500);
    res.render('500', { error: err, env: app.get('env') });
});

app.start = function (port, done) {
    hbs.registerPartials(__dirname + '/views/partials', function () {
        var server = app.listen(port, function () {
            console.log('Full On now listening on port ' + port);
        });
        if(done){
            done(server);
        }
    });
};

module.exports = app;