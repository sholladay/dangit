// This is the base configuration for the testing framework.
// You can import and extend it for special use cases.

define(
    [],
    function () {

        'use strict';

        var
            proxyPort = 9000,
            // This path is relative to baseUrl.
            testDir = 'test/',
            // Name of the alias to the unit suite directory.
            UNIT_PKG = 'unit',
            // Name of the alias to the functional suite directory.
            FUNC_PKG = 'functional';

        return {
            proxyPort : proxyPort,
            proxyUrl  : 'http://localhost:' + proxyPort + '/',

            // Places where unit and/or functional tests will be run.
            environments : [
                // { browserName : 'firefox' },
                // { browserName : 'safari' },
                { browserName : 'chrome' }
            ],

            maxConcurrency : 1,  // how many browsers may be open at once

            // Specify which AMD module loader to use...
            // loaders : {
            //
            // },
            // Options to pass to the AMD module loader...
            loaderOptions : {
                packages : [
                    { name: 'dangit', location: 'lib' },
                    { name: 'test', location: testDir },
                    { name: UNIT_PKG, location: testDir + 'unit' },
                    { name: FUNC_PKG, location: testDir + 'functional' },
                    { name: 'page-object', location: testDir + 'page-object', main: 'index' },
                    { name: 'utility', location: testDir + 'util', main: 'index' }
                ]
            },

            // Each cloud testing service has their own weird quirks and different APIs,
            // so load up the necessary configuration to talk to them...
            tunnel : 'NullTunnel',         // no tunnel (default, if none provided)
            // tunnel : 'BrowserStackTunnel', // BrowserStack
            // tunnel : 'SauceLabsTunnel',    // SauceLabs
            // tunnel : 'TestingBotTunnel',   // TestingBot
            tunnelOptions : {
                host : 'localhost:4447'  // custom location to find the selenium server
                // verbose : true           // more logging, only supported by BrowserStack
            },

            // Which unit test suite files to load. These check our APIs.
            suites : [
                UNIT_PKG + '/**/*.js'
            ],
            // Which functional test suite files to load. These check our
            // user-facing behavior.
            // TODO: Re-enable when we have functional tests.
            functionalSuites : false,
            // functionalSuites : [
            //     FUNC_PKG + '/**/*.js'
            // ],

            // Test whitelist regex. Only test IDs ('suite name - test name')
            // that match this pattern will run, all others will be skipped.
            // grep : /.*/,

            // Ignore some code from test coverage reports, even if it loads
            // during testing. The paths that match this pattern will NOT
            // count against coverage.
            excludeInstrumentation : /^(?:config|test|node_modules)\//

            // How to display or save test run info.
            // reporters : [
            //     // Test result reporters.
            //     { id : 'Runner' }
            //     // { id : 'JUnit',    filename : 'report/test/junit.xml' },
            //     // // Code coverage reporters.
            //     // { id : 'Cobertura', filename  : 'report/coverage/info/cobertura.info' },
            //     // { id : 'Lcov',      filename  : 'report/coverage/info/lcov.info' },
            //     // { id : 'LcovHtml',  directory : 'report/coverage/html' }
            // ]
        };
    }
);

