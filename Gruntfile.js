module.exports = (grunt) => {

    'use strict';

    // Project configuration.
    grunt.initConfig({
        // Getting the full node app configuration as an object
        // which can be used internally...
        pkg : grunt.file.readJSON('package.json'),

        // Clean configuration, used to whipe out temporary build data,
        // for more robust and reliable builds...
        clean : {
            // options : {
            // //    'no-write': true // this does a dry-run, logs but no actual file deletion
            // },
            normal : {
                src : [
                    'build' // directory created by the build process
                ]
            }
        },

        // JSONLint configuration, used for linting config files...
        jsonlint : {
            normal : {
                // be explicit, globbing too much hurts performance...
                src : [
                    'package.json',
                    'config/**/*.json',
                    'test/**/*.json',
                    'lib/**/*.json'
                ]
            }
        },

        // JSHint configuration, used for linting the library...
        jshint : {
            options : {
                // Options here override JSHint defaults and are 'task local',
                // meaning all targets in this task inherit these options...
                bitwise       : true,      // disallow bitwise - helps avoid mistyped && statements
                curly         : true,      // require curly braces when optional
                eqeqeq        : true,      // require strict equality checks (=== vs ==)
                esversion     : 6,         // adhere to a specific EcmaScript version
                freeze        : true,      // prohibit altering the prototype of native objects
                immed         : true,      // IIFEs must be wrapped in parentheses (function(){}())
                indent        : 4,         // NOT ENFORCED, intended spaces-per-tab for better error messages
                latedef       : true,      // variables and functions must be declared before use
                maxdepth      : 8,         // don't allow insane nesting of blocks
                maxlen        : 115,       // max number of characters per line
                maxparams     : 4,         // max number of parameters per function
                maxstatements : 18,        // max number of statements per function (and functions count as 1)
                newcap        : true,      // require capitalized constructor functions
                noarg         : true,      // prohibit using arguments.caller or arguments.callee
                noempty       : true,      // prohibit empty blocks of code
                nonbsp        : true,      // prohibit no-break spaces in code (HTML entities are fine)
                nonew         : true,      // must assign result of new Constructor() calls to a variable
                plusplus      : true,      // whether to disallow using ++ or --
                camelcase     : true,      // whether to enforce camelCase or UPPERCASE_WITH_UNDERSCORES
                quotmark      : 'single',  // must use single quotes for strings (easier to make bookmarks)
                strict        : true,      // all functions must be inside of a 'srtict mode' scope
                undef         : true,      // disallow using variables before they are defined
                unused        : true,      // disallow unused variables
                // Relax, bro...
                browser       : true,      // we will be in a browser, with a window and document, etc.
                devel         : true       // allow console, alert, etc.
            },
            grunt : {
                // This target is intended to isolate the linting configuration
                // for the app's Gruntfile.js to only where it really matters...
                options : {
                    camelcase : false,  // whether to enforce camelCase or UPPERCASE_WITH_UNDERSCORES
                    globals : {
                        module : false  // whether to allow assigning to this object
                    }
                },
                files : {
                    src : ['Gruntfile.js']
                }
            },
            tests : {
                // This target is intended to isolate the linting configuration
                // for the app's tests to only where it really matters...
                options : {
                    strict : false,  // tests should be allowed to use APIs not available in strict mode
                    globals : {
                        define   : false, // used by AMD modules
                        suite    : false, // used by the testing framework
                        test     : false, // used by the testing framework
                        dangit   : false  // used by the main library
                    },
                    // This tells JSHint to ignore the use of 'with' statements,
                    // which we are okay with in our testing framework...
                    '-W085' : true
                },
                files : {
                    src : [
                        'test/**/*.js'
                    ]
                }
            },
            js : {
                // This target is the main one, and affects most of the app...
                options : {
                    plusplus  : false,  // whether to disallow using ++ or --
                    node      : true    // activate special behavior for Node.js (such as globals)
                },
                files : {
                    src : [
                        'lib/**/*.js'
                    ]
                }
            }
        },

        // JSCS configuration, used for enforcing code style requirements...
        jscs : {
            options : {
                config : 'config/code-style.json'
            },
            grunt : {
                options : {
                    requireCamelCaseOrUpperCaseIdentifiers : 'ignoreProperties'
                },
                files : {
                    src : [
                        'Gruntfile.js'
                    ]
                }
            },
            tests : {
                options : {
                    disallowKeywords : null  // tests are allowed to use 'with'
                },
                files : {
                    src : [
                        'test/**/*.js'
                    ]
                }
            },
            js : {
                files : {
                    src : [
                        'lib/**/*.js'
                    ]
                }
            }
        },

        // JSLint configuration, used for optional advice on code style...
        jslint : {
            grunt : {
                directives : {
                    predef : [    // list of global variables we should be able to use
                        'module'
                    ]
                },
                files : {
                    src : [
                        'Gruntfile.js'
                    ]
                }
            },
            js : {
                options : {
                    edition : 'latest'  // version of JSLint to use
                },
                directives : {
                    browser : true,  // we will be in a browser, with a window and document, etc.
                    devel   : true,  // allow use of APIs like the the console
                    // maxlen  : 140,   // maximum number of characters on a single line
                    white   : true,  // be quiet about our pretty whitespace conventions
                    unparam : true,  // allow unused parameters (JSHint is more flexible with this)
                    predef  : [
                        // List of global variables we should be able to use...
                        // 'dangit'
                    ]
                },
                files : {
                    src : [
                        'source/**/*.js'
                    ]
                }
            }
        },

        // Selenium configuration, used for the app's functional testing...
        selenium_start : {
            // NOTE: This server is destroyed when grunt exits.
            // You MUST chain this with other tasks.
            options : {
                port : 4447  // Override Selenium default of 4444, which is taken on OS X Server
            }
        },

        // Intern configuration, used for the app's unit testing and functional testing...
        intern : {
            options : {
                config  : 'config/intern',  // path to the default testing framework config
                runType : 'runner'          // 'runner' to run in a browser, 'client' for Node.js
            },
            normal : {
                // empty target because it inherits task local options
            },
            cloud : {
                options : {
                    config : 'config/intern-cloud'
                }
            },
            ci : {
                options : {
                    config : 'config/intern-ci'
                }
            }
        },

        // Selenium configuration, used for the app's functional testing...
        selenium_stop : {
            options : { }
        },

        // Watch configuration, used for automatically executing
        // tasks when saving app files during development...
        watch : {
            files : ['**.*'],  // files to watch for changes
            tasks : ['lint']   // tasks to trigger when watched files change
        }
    });

    // Load the plugin that provides the "clean" task.
    grunt.loadNpmTasks('grunt-contrib-clean');
    // Load the plugin that provides the "jsonlint" task.
    grunt.loadNpmTasks('grunt-jsonlint');
    // Load the plugin that provides the "jshint" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    // Load the plugin that provides the "jscs" task.
    grunt.loadNpmTasks('grunt-jscs');
    // Load the plugin that provides the "jslint" task.
    grunt.loadNpmTasks('grunt-jslint');
    // Load the plugin that provides the "start_selenium" and "start_selenium" tasks.
    grunt.loadNpmTasks('grunt-selenium-webdriver');
    // Load the plugin that provides the "intern" task.
    grunt.loadNpmTasks('intern');
    // Load the plugin that provides the "watch" task.
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Make a new task called 'lint'.
    grunt.registerTask('lint', ['jsonlint', 'jshint', 'jscs']);
    // Make a new task called 'opinion'.
    grunt.registerTask('opinion', ['lint', 'jslint']);
    // Make a new task called 'test'.
    grunt.registerTask('test', ['selenium_start', 'intern:normal']);
    grunt.registerTask('test-ci', ['selenium_start', 'intern:ci']);

    // Default task, will run if no task is specified.
    grunt.registerTask('default', ['clean', 'lint']);

};
