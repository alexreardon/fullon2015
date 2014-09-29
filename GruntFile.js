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
            'public/js/pages/index.js'
        ],

        handlebars_templates = 'public/js/template/**/*.handlebars',

        less_files = ['public/less/**/*.less'],
        sass_files = ['public/scss/**/*.scss'];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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

    //Development
//	grunt.registerTask('dev', ['less:dev', 'browserify', 'concat']);
    grunt.registerTask('dev', ['sass', 'concat', 'run']);

    grunt.registerTask('run', ['concurrent:target']);

    //Release
    grunt.registerTask('default', ['jshint', 'sass', 'browserify', 'concat', 'uglify:prod']);

    //Heroku
    // grunt.registerTask('heroku:production', 'default');

};