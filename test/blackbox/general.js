var expect = require('expect.js'),
	request = require('request'),
	format = require('util').format,
	config = require('../../config'),
	app = require('../../app');

describe('Routes - General', function () {
	// Some of these tests can take some time
	this.timeout(10000);

	var port = 8080,
		server;

	beforeEach(function (done) {
        app.start(port, function(_server){
			console.log('Dev: App now listening on ' + port);
            server = _server;
            done();
        });
	});

	afterEach(function () {
		server.close();
	});

	function get_path (url) {
		return format('%s:%s/%s', config.root_url, port, url);
	}

	it('should serve the home page', function (done) {
		request(get_path(''), function (error, response, body) {
			expect(response.statusCode).to.be(200);
			done();
		});
	});

	it.skip('should serve 404 pages', function (done) {
		request(get_path('/some/fake/route'), function (error, response, body) {
			expect(response.statusCode).to.be(404);
			done();
		});
	});

});