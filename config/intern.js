// This is the base configuration for the testing framework.
// You can import and extend it for special use cases.

define(() => {
    'use strict';

    const proxyPort = 9000;
    // This path is relative to baseUrl.
    const testDir = 'test/';
    // Name of the alias to the unit suite directory.
    const UNIT_PKG = 'unit';
    // Name of the alias to the functional suite directory.
    const FUNC_PKG = 'functional';

    return {
        proxyPort,
        proxyUrl  : `http://localhost:${proxyPort}/`,

        // Places where unit and/or functional tests will be run.
        environments : [
            // { browserName : 'firefox' },
            { browserName : 'safari' }
            // { browserName : 'chrome' }
        ],

        // How many browsers may be open at once.
        maxConcurrency : 1,

        // Use a custom AMD module loader.
        // loaders : {
        //
        // },
        // Configure the AMD module loader.
        loaderOptions : {
            packages : [
                { name: 'dangit',   location: '.', main : 'index' },
                { name : 'test',    location: testDir },
                { name : UNIT_PKG,  location: testDir + 'unit' },
                { name : FUNC_PKG,  location: testDir + 'functional' },
            ]
        },

        // The provider for a WebDriver server.
        tunnel : 'SeleniumTunnel',
        // tunnelOptions : {
        //     host : 'localhost:4447'  // custom location to find the selenium server
        // },

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
});
