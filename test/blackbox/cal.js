var expect = require('expect.js'),
    request = require('request'),
    format = require('util').format,
    config = require('../../config'),
    app = require('../../app');

describe('Routes - Calendar', function () {
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

    it('should be a valid route', function (done) {
        request(get_path('cal/fullon.ics'), function (error, response, body) {
            expect(response.statusCode).to.be(200);
            done();
        });
    });

    it('should serve a calendar file', function (done) {
        request(get_path('cal/fullon.ics'), function (error, response, body) {
            expect(response.headers['content-type']).to.eql('text/calendar; charset=utf-8');
            done();
        });
    });

    // TODO: recreate the cal event and ensure it parses correctly

});