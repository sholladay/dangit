// This module modifies the configuration for the testing framework to use cloud platforms.

define(
    [   // dependencies....
        './intern'  // base configuration
    ],
    function (test) {

        // Setting properties on the test object here overrides the base configuration.
        // Best practice is to set only what needs to be different.

        // test.proxyPort = 9000;
        // test.proxyUrl = 'http://localhost:9000/';

        // test.capabilities = {
        //     // See examples: https://code.google.com/p/selenium/wiki/DesiredCapabilities
        //     'name'             : 'Automated tests - dangit.js',  // name of the test run to log
        //     'selenium-version' : '2.43.1',  // request a version, which may not always be respected
        //     'build'            : build  // useful to log success history tied to code changes
        // };
        // Places where unit and/or functional tests will be run...
        test.environments = [
            // local-style...
            // {
            //     browserName: 'phantomjs',  // command line browser, very fast for tests
            //     // pretend to be Chrome, to avoid fallbacks...
            //     'phantomjs.page.settings.userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36'
            // }
            // { browserName: 'chrome' },
            // { browserName: 'firefox' },
            // { browserName: 'safari' }
            // BrowserStack-style...
            { os: 'Windows', os_version: '8.1',       browser: 'chrome',  browser_version: '36.0' }
            // { os: 'Windows', os_version: '8.1',       browser: 'firefox', browser_version: '31.0' },
            // { os: "Windows", os_version: '8.1',       browser: 'ie',      browser_version: '11.0' },
            // { os: 'OS X',    os_version: 'Mavericks', browser: 'safari',  browser_version: '7.0' }
            // SauceLabs-style...
            // { platform: 'Windows 8.1', browserName: 'chrome',            version: '36' },
            // { platform: 'Windows 8.1', browserName: 'firefox',           version: '31' },
            // { platform: 'Windows 8.1', browserName: 'internet explorer', version: '11' },
            // { platform: 'OS X 10.9',   browserName: 'safari',            version: '7' }
        ];

        // test.maxConcurrency = 10;  // how many browsers may be open at once

        // Specify which AMD module loader to use...
        // test.useLoader = {

        // };
        // Options to pass to the AMD module loader...
        // test.loader = {
        //     packages: [
        //         { name: 'unit', location: testDir + 'unit' },
        //         { name: 'functional', location: testDir + 'functional' }
        //     ]
        // };

        // Each cloud testing service has their own weird quirks and different APIs,
        // so load up the necessary configuration to talk to them...
        // test.tunnel = 'NullTunnel';         // no tunnel (default, if none provided)
        test.tunnel = 'BrowserStackTunnel'; // BrowserStack
        // test.tunnel = 'SauceLabsTunnel';    // SauceLabs
        // test.tunnel = 'TestingBotTunnel';   // TestingBot
        test.tunnelOptions = {
            // host: '127.0.0.1:4447',  // custom location to find the selenium server
            // verbose: true            // more logging, only supported by BrowserStack
        };

        // These are unit tests, which check the APIs of our application...
        // test.suites = [
        //     'test/unit/color'
        // ];
        // These are functional tests, which check the user-facing behavior of our application...
        // test.functionalSuites = [

        // ];

        // Any test IDs ("suite name - test name") which do NOT match this regex will be skipped...
        // test.grep = /.*/;

        // The paths that match this regex will NOT be included in code coverage reports...
        // test.excludeInstrumentation = /^(?:config|test|node_modules)\//;

        // Returns the modified settings...
        return test;
    }
);
