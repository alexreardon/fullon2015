var person = require('../models/person'),
	config = require('../config');


exports.leaderboard = function(req, res, next){

	//(query, cb, limit, sort)
	//find all people with sold > 0, limit: 10, in decending order of amount sold
	person.find({sold: {$gt: 0}}, function(err, data){

		if(err){
			next(new Error(err));
			return;
		}


		res.render('demo', {people: data, leaderboard_size: config.leaderboard_size});
	}, config.leaderboard_size, {sold: -1, firstname: 1});


};