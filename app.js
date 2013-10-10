var express = require('express'),
	config = require('./config'),
	_ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	format = require('util').format,
	hbs = require('hbs'),
	//helpers is not referred to directly - it
	helpers = require('./views/helpers'),
	locals = require('./util/locals'),
	app = express();

//views
app.set('views', __dirname + '/views');
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

//middleware - features

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(config.cookie_secret));
app.use(express.session());

//static file serving
app.use('/public', express.static(path.join(__dirname, '/public')));

console.log('favicon: ' + path.join(__dirname + '/public/images/favicon.ico'));

//bootstrap data
app.locals.bootstrap = JSON.stringify(locals.bootstrap);

//middleware - flow
app.use(app.router);

//TODO: routeNotFound
//app.use(routeNotFound);

//development
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

//production
var errorHandler = function (err, req, res, next) {
	//TODO: load error view
};

if ('production' === app.get('env')) {
	app.use(express.errorHandler());
	//app.use(errorHandler); TODO
}

//export app for routes - must be here
module.exports = app;

//load in routes
_.each(fs.readdirSync('./routes'), function (file) {
	require('./routes/' + file);
});

//start the server
app.listen(config.port, function () {
	console.log('Full On now listening on port ' + config.port);
});