var format = require('util').format,
    _ = require('underscore');

// environment config: https://docs.google.com/spreadsheet/ccc?key=0AqpFjrRXOZsGdENRbllvTThURFViMTB4N1VSQjJ0ckE#gid=0
// request access from Alex Reardon

// used in multiple places
var date_earlybird_end = '15.11.2015',
    date_format_short = 'DD.MM.YYYY';

var config = {

    /*** SERVER ***/
    // url
    root_url: process.env.fullon_root_url || 'http://localhost',

    // database
    db_connection: process.env.fullon_db_connection,

    // web
    port: process.env.PORT || 80,
    tz: process.env.TZ || 'Australia/Sydney',
    cookie_secret: process.env.fullon_cookie_secret || 'some secret key',
    session_secret: process.env.fullon_session_secret || 'some session secret',

    // google
    google_username: process.env.fullon_google_username,
    google_password: process.env.fullon_google_password,
    google_spreadsheet_key: process.env.fullon_google_spreadsheet_key,

    // authentication
    job_username: process.env.fullon_job_username || 'username',
    job_password: process.env.fullon_job_password || 'password',

    paypal: {
        username: process.env.fullon_paypal_username || 'alexreardon-facilitator_api1.gmail.com',
        password: process.env.fullon_paypal_password || '1381729133',
        signature: process.env.fullon_paypal_signature || 'An5ns1Kso7MWUdW4ErQKJJJ4qi4-AuUF7YBYnzvqG3J1tnJzoLJv0Fpj',
        currency_code: 'AUD',
        sandbox_mode: process.env.fullon_paypal_sandbox_mode === 'on'
    },

    // late registration code (can be used to reactivate registrations)
    late_registration_code: process.env.fullon_late_registration_code || '1234',

    // emails - used for bcc on confirmations
    // conditionally added - see below
    admin_emails: [],

    // used for error logs
    support_emails: ['alexreardon@gmail.com'],

    // public variables
    application: {

        leaderboard_size: 10,

        // dates
        date_format_short: date_format_short,
        date_format_long: date_format_short + ' HH:mm',
        date_format_readable: 'Do MMMM YYYY', // 1st January 2015
        date_format_file: 'YYYY-MM-DD--HH-mm-ss',
        date_format_ical: 'YYYYMMDDTHHmmssZ',
        date_format_time: 'HH:mm',

        date_camp_start: '02.01.2016 10:00',
        date_camp_end: '07.01.2016 15:00',
        // 3pm
        date_register_end: '13.12.2015',
        date_earlybird_end: date_earlybird_end,

        // camper types
        camper_types: {
            junior: {
                fee: 330,
                years: [6, 7, 8],
                description: 'Years 6-8',
                icon: 'fa-leaf'
            },
            senior: {
                fee: 350,
                years: [9, 10, 11, 12],
                description: 'Years 9-12',
                icon: 'fa-paper-plane-o'
            },
            leader: {
                fee: 330,
                description: 'The Masters',
                icon: 'fa-coffee'
            }
        },

        // discounts
        discounts: {
            chocolate: {
                name: 'Selling chocolate',
                available_to: ['junior', 'senior', 'leader'],
                amount: 20,
                description: 'Per box',
                question: 'Did you sell any boxes of chocolate for camp?'
            },
            earlybird: {
                name: 'Early bird',
                available_to: ['junior', 'senior', 'leader'],
                amount: 20,
                description: format('Register on or before %s', date_earlybird_end),
                question: format('Are you registering on or before %s?', date_earlybird_end)
            },
            sibling: {
                name: 'Sibling',
                available_to: ['junior', 'senior'],
                amount: 25,
                description: 'Available if you have a sibling also going to Full On',
                question: 'Do you have any siblings going on Full On?'
            },
            married: {
                name: 'Married',
                available_to: ['leader'],
                amount: 10,
                description: 'Available if you are a married leader and your spouse is going to full on',
                question: 'Are you married and is your spouse also going to full on?'
            }
        },

        // payments
        payment_types: {
            paypal: {
                name: 'payment_paypal',
                text: 'PayPal'
            },
            other: {
                name: 'payment_other',
                text: 'Bank Deposit, cash and other as organised with Mike Smith'
            },
            installment: {
                name: 'payment_installment',
                text: 'Pay by installment'
            },
            request_assistance: {
                name: 'payment_request_assistance',
                text: 'Request assistance'
            }
        },

        bank_details: {
            name: 'St Philips Anglican Church Youth Fellowship',
            bsb: '062 161',
            number: '00900260'
        }

    }
};

//environment force - want to make ultra sure we don't play with production db
if (process.env.NODE_ENV !== 'production') {
    console.info('using development database');
    config.db_connection = 'mongodb://127.0.0.1:27017/test';
}

// admin_emails
config.admin_emails.push('alexreardon@gmail.com');
if (process.env.NODE_ENV === 'production') {
    config.admin_emails.push('mikes@stphils.org.au');
    config.admin_emails.push('geoffpullen@outlook.com');
}

var errors = [];
_.each(config, function(item, i) {
    if (!item) {
        errors.push(i);
    }
});

if (errors.length) {
    console.warn(format('missing config entries for: %j', errors));
}

module.exports = config;