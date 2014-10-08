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
_.each(helpers, function(val, key) {
    hbs.registerHelper(key, val);
});

// Middleware - Express
app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.urlencoded({
    extended: true
}));
//app.use(bodyParser.json());
//app.use(methodOverride());
//app.use(cookieParser(config.cookie_secret));
app.use(session({
    secret: config.session_secret,
    resave: true,
    saveUninitialized: true
}));

// Static file serving
app.use('/public', express.static(path.join(__dirname, '/public')));

// Bootstrap data
app.locals.bootstrap = JSON.stringify(locals.bootstrap);

// Load in routes
_.each(fs.readdirSync('./routes'), function(file) {
    if (file !== 'error.js') {
        require('./routes/' + file).routes(app);
    }
});

// Error routes
require('./routes/error.js').routes(app);

app.start = function(port, done) {
    hbs.registerPartials(__dirname + '/views/partials', function() {
        var server = app.listen(port, function() {
            console.log('Full On now listening on port ' + port);
        });
        if (done) {
            done(server);
        }
    });
};

module.exports = app;