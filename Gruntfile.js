'use strict';

module.exports = (grunt) => {
    // Project configuration.
    grunt.initConfig({
        // Selenium configuration, used for the functional testing.
        // This server is destroyed when grunt exits.
        // You MUST chain this with other tasks.
        selenium_start : {
            options : {
                // Override Selenium default of 4444, which is taken on OS X Server.
                port : 4447
            }
        },

        // Intern configuration, used for the app's unit testing and functional testing...
        intern : {
            options : {
                config  : 'config/intern',  // path to the default testing framework config
                runType : 'runner'          // 'runner' to run in a browser, 'client' for Node.js
            },
            // Empty because it inherits task local options.
            normal : {

            },
            cloud : {
                options : {
                    config : 'config/intern-cloud'
                }
            }
        },

        // Selenium configuration, used for the app's functional testing.
        selenium_stop : {
            options : { }
        },

        // Watch configuration, used for automatically executing
        // tasks when saving app files during development.
        watch : {
            files : ['**.*'],  // files to watch for changes
            tasks : ['test']   // tasks to trigger when watched files change
        }
    });

    // Load the plugin that provides the "start_selenium" and "start_selenium" tasks.
    grunt.loadNpmTasks('grunt-selenium-webdriver');
    // Load the plugin that provides the "intern" task.
    grunt.loadNpmTasks('intern');
    // Load the plugin that provides the "watch" task.
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Make a new task called 'test'.
    grunt.registerTask('test', ['selenium_start', 'intern:normal']);

    // Default task, will run if no task is specified.
    grunt.registerTask('default', ['test']);
};
