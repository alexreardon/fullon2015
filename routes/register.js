var config = require('../config'),
    person = require('../models/person'),
    date = require('../util/date'),
    schema = require('../forms/register/schema'),
    validation = require('../util/validation'),
    registration = require('../models/registration'),
    _ = require('underscore'),
    payment = require('./payment'),
    email = require('../util/email'),
    format = require('util').format;

var scripts = ['/public/js/build/register.build.js'],
    success_url = '/register/confirmation';

exports.get_invalid_fields = function(schema, post) {
    var failed_fields = [];

    if (!post.camper_type) {
        failed_fields.push({field: schema.allegiance.camper_type, post: 'camper_type'});
    }

    _.each(schema, function(section) {
        return _.each(section.fields, function(field) {
            var success = exports.validate_field(field, post);
            if (!success) {
                failed_fields.push({field: field, post: post[field.name]});
            }
        });
    });

    return failed_fields;
};

exports.validate_field = function(field, post) {
    // no validation required
    if (!field.validation) {
        return true;
    }
    var required = field.validation.required;
    var value = post[field.name];

    // 1. if required: run checks
    // 2. if not required but there is a value: run checks
    if (required || (!required && value && value !== '')) {

        // only run the check if the field is available to the camper_type
        if (!field.available_to || _.contains(field.available_to, post.camper_type)) {
            return exports.validate_item(field, value);
        }
    }

    return true;
};

exports.validate_item = function(field, post_value) {
    // rules
    return _.every(field.validation, function(value, key) {
        return validation[key].fn(post_value, value);
    });
};

exports.calculate_total = function(camper_type_name, post) {
    // not trusting client side for total
    // total = camp_fee - discounts + donation
    var total = config.application.camper_types[camper_type_name].fee;

    // discounts
    _.each(config.application.discounts, function(discount, key) {
        if (_.contains(discount.available_to, camper_type_name)) {
            if (!post[key]) {
                return true;
            }
            if (post[key] === 'yes') {
                if (key === 'chocolate' && post.chocolate_box_amount) {
                    total -= (parseFloat(post.chocolate_box_amount) * config.application.discounts[key].amount);
                } else {
                    total -= config.application.discounts[key].amount;
                }
            }
        }
    });

    // donation
    if (post.donation) {
        total += parseFloat(post.donation);
    }

    //console.log('total:', total);
    return total;

};

exports.render_landing = function(req, res, next, validation_error) {
    var data = date.get_page_data();

    // render 'register_closed' if:
    // 1. NOT late_registration_allowed AND
    // 2. registration is closed
    if (!req.session.late_registration_allowed && !data.is_registration_open) {
        return res.render('register_closed');
    }

    person.find({}, function(err, people) {
        if (err) {
            return next(new Error(err));
        }

        res.render('register', {
            title: 'Register',
            config: config.application,
            scripts: scripts,
            validation_error: validation_error,
            data: data,
            people: people,
            schema: schema.populate()
        });

    }, null, {firstname: 1, lastname: 1});
};

exports.routes = function(app) {
    app.get('/register', function(req, res, next) {
        exports.render_landing(req, res, next);
    });

    app.post('/register', function(req, res, next) {
        var post = req.body;

        // validate form
        var invalid_fields = exports.get_invalid_fields(schema.populate(), post);
        if (invalid_fields.length) {
            console.warn('error validating form');
            //console.warn(invalid_fields);
            return exports.render_landing(req, res, next, true);
        }

        //console.log(format('successful post: %j', post));

        var total = exports.calculate_total(post.camper_type, post);

        post.payment_total = total;
        req.session.pending_registration = {
            data: post,
            _id: registration.create_id(post.first_name, post.last_name)
        };

        // PayPal
        if (post.payment_method === config.application.payment_types.paypal.name) {
            return payment.make_payment({
                res: res,
                req: req,
                next: next,
                total: total,
                _id: req.session.pending_registration._id,
                email: post.payer_email,
                success_url: success_url
            });
        }

        // Other payment types: registration is complete!
        // confirmation page saves the form
        res.redirect(success_url);

    });

    app.get(success_url, function(req, res, next) {
        if (!req.session.pending_registration) {
            return res.redirect('/');
        }

        var r = registration.create({
            data: req.session.pending_registration.data,
            _id: req.session.pending_registration._id
        });

        r.save(function(err) {
            // unset pending registration
            req.session.pending_registration = null;

            if (err) {
                return next(new Error('an error occured while writing registration to disk. Please contact technical support'));
            }

            var data = {
                config: config,
                registration: r,
                title: 'Confirmation'
            };

            //console.log(format('saved registration: %j', r.data));

            // send confirmation email
            email.send({
                to: r.data.payer_email,
                subject: 'Registration Confirmation',
                template_name: 'register_confirmation',
                template_data: _.extend({
                    email: true
                }, data),
                // let admin's know that a registration has occurred
                bcc: config.admin_emails
            });

            // render confirmation screen
            res.render('register_confirmation', data);

        });

    });

    // late registrations
    app.get('/register/late', function(req, res) {

        // if already allowed, just redirect to /register
        if (req.session.late_registration_allowed) {
            return res.redirect('/register');
        }

        res.render('register_late');
    });

    app.post('/register/late', function(req, res) {
            var post = req.body;

            if (post.late_code === config.late_registration_code) {
                req.session.late_registration_allowed = true;
                return res.redirect('/register');
            }

            res.render('register_late', { error: true });
        }
    );

};

