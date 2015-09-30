var nodemailer = require('nodemailer'),
    config = require('../config'),
    handlebars = require('handlebars'),
    fs = require('fs'),
    path = require('path'),
    format = require('util').format,
    templates = require('./templates').email;


var transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.google_username,
        pass: config.google_password
    }
});

module.exports = {
    send_error_email: function(err) {
        this.send({
            to: config.support_emails,
            subject: 'FullOn Error',
            template_name: 'error',
            template_data: {
                error: err
            }
        });
    },
    post: function(params) {
        // mandatory
        var options = {
            to: params.to,
            subject: params.subject,
            from: format('Full On <%s>', config.google_username),
            html: templates[params.template_name](params.template_data || {}),
            cb: params.cb
        };

        //optional
        if (params.bcc) {
            options.bcc = params.bcc;
        }

        console.log(format('sending email [to: "%s" subject: "%s"]', options.to, options.subject));
        transport.sendMail(options, function(err, response) {

            if (err) {
                console.error('failed: ' + err);
            } else {
                console.log('success');
            }

            if (options.cb) {
                options.cb(err, response);
            }
        });
    },

    send: function(params) {
        /*
         to, bcc*, subject, template_name, template_data, cb (* = optional)
         */

        if (!templates[params.template_name]) {
            console.error('email template not found: ' + params.template_name);
            if (params.cb) {
                params.cb('email template not found: ' + params.template_name);
            }
            return;
        }

        //put on the end of the event queue
        process.nextTick(function() {
            this.post(params);
        }.bind(this));
    }
};