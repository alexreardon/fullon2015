module.exports = function(grunt) {

    var node_js_files = [
            '**/*.js',
            '!node_modules/**/*.js',
            '!bower_components/**/*.js',
            '!public/**/*.js'
        ],

        client_js_lib_files = [
            'bower_components/underscore/underscore.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/player-api/javascript/froogaloop.js',
            'bower_components/backbone/backbone.js',
            'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js'
        ],

        client_js_app_files = [
            'public/js/common.js',
            'util/validation.js',
            'public/js/pages/index.js',

            'public/js/pages/register/views/common.js',
            'public/js/pages/register/views/allegiance.js',
            'public/js/pages/register/views/basic.js',
            'public/js/pages/register/views/costs.js',
            'public/js/pages/register/views/payment.js',

            'public/js/pages/register/routers/router.js'
        ],

        handlebars_templates = 'public/js/template/**/*.handlebars',

        less_files = ['public/less/**/*.less'],
        sass_files = ['public/scss/**/*.scss'];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        paths: {
            bower: 'bower_components',
            modernizr: '<%= paths.bower %>/modernizr/modernizr.js',
            buildJS: 'public/js/build'
        },

        jshint: {
            node: {
                options: grunt.file.readJSON('.jshintrc'),
                files: {
                    src: node_js_files
                }
            },
            client: {
                options: grunt.file.readJSON('public/js/.jshintrc'),
                files: {
                    src: client_js_app_files
                }
            }
        },

        less: {
            dev: {
                files: {
                    'public/css/build.css': 'public/less/main.less'
                }
            },
            prod: {
                files: {
                    'public/css/build.css': 'public/less/main.less'
                },
                options: {
                    yuicompress: true
                }
            }
        },

        sass: {                                    // task
            dist: {                                // target
                files: {                        // dictionary of files
                    'public/css/main.css': 'public/scss/main.scss'        // 'destination': 'source'
                },
                options: {
                    // includePaths: require('node-bourbon').with('other/path', 'another/path')
                    // - or -
                    includePaths: require('node-bourbon').includePaths
                }
            }
        },

        browserify: {
            main: {
                files: {
                    'public/js/build/common.build.js': ['public/js/common.js']
                }
            }
        },

        concat: {
            lib: {
                src: client_js_lib_files,
                dest: 'public/js/build/lib.js'
            },
            app: {
                src: client_js_app_files,
                dest: 'public/js/build/app.js'
            }
        },

        uglify: {
            prod: {
                options: {
                    mangle: false,
                    compress: true,
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("dd-mm-yyyy") %> */'
                },
                files: [
                    {'public/js/build/lib.js': 'public/js/build/lib.js'},
                    {'public/js/build/app.js': 'public/js/build/app.js'}
                ]
            }
        },

        watch: {
            node_js: {
                tasks: ['jshint:node'],
                files: node_js_files
            },
            client_js_lib: {
                tasks: ['concat:lib'],
                files: client_js_lib_files
            },
            client_js_app: {
                tasks: ['jshint:client', 'concat'],
                files: client_js_app_files
            },
            sass: {
                tasks: ['sass'],
                files: sass_files
            },
            less: {
                tasks: ['less:dev'],
                files: less_files
            }

        },

        concurrent: {
            target: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    ext: 'js,hbs',
                    env: {
                        PORT: 8181
                    }
                }
            }
        },

        modernizr: {

            dist: {
                // [REQUIRED] Path to the build you're using for development.
                'devFile': '<%= paths.modernizr %>',

                // [REQUIRED] Path to save out the built file.
                'outputFile': '<%= paths.buildJS %>/modernizr.js',

                // Based on default settings on http://modernizr.com/download/
                'extra': {
                    'shiv': true,
                    'printshiv': true,
                    'load': true,
                    'mq': true,
                    'cssclasses': true
                },

                // Based on default settings on http://modernizr.com/download/
                'extensibility': {
                    'addtest': false,
                    'prefixed': false,
                    'teststyles': true,
                    'testprops': true,
                    'testallprops': true,
                    'hasevents': false,
                    'prefixes': true,
                    'domprefixes': true
                },

                // By default, source is uglified before saving
                'uglify': true,

                // Define any tests you want to implicitly include.
                'tests': [
                    'backgroundsize',
                    'opacity',
                    'rgba',
                    'cssanimations',
                    'generatedcontent',
                    'cssgradients',
                    'csstransitions',
                    'csstransforms',
                    'video'
                ],

                // By default, this task will crawl your project for references to Modernizr tests.
                // Set to false to disable.
                'parseFiles': true,

                // When parseFiles = true, this task will crawl all *.js, *.css, *.scss files, except files that are in node_modules/.
                // You can override this by defining a 'files' array below.
                'files': {
                    'src': client_js_app_files
                },

                // When parseFiles = true, matchCommunityTests = true will attempt to
                // match user-contributed tests.
                'matchCommunityTests': false,

                // Have custom Modernizr tests? Add paths to their location here.
                'customTests': []
            }

        }
    });

    //Load plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-modernizr');

    //Development
//	grunt.registerTask('dev', ['less:dev', 'browserify', 'concat']);
    grunt.registerTask('dev', ['sass', 'concat', 'modernizr', 'run']);

    grunt.registerTask('run', ['concurrent:target']);

    //Release
    grunt.registerTask('default', ['jshint', 'sass', 'concat', 'modernizr', 'uglify:prod']);

    //Heroku
    // grunt.registerTask('heroku:production', 'default');

};