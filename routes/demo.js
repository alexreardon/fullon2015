var person = require('../models/person'),
	config = require('../config'),
	app = require('../app');


app.get('/demo/leaderboard', function(req, res, next){

	//(query, cb, limit, sort)
	//find all people with sold > 0, limit: 10, in decending order of amount sold
	person.get_leaderboard(function(err, people){
		if(err){
			next(new Error(err));
			return;
		}

		res.render('demo', {people: people, leaderboard_size: config.leaderboard_size});
	});

});

app.get('/demo/handlebar', function(req, res, next){
	res.render('test', {text: 'HELLO WORLD'});
});
