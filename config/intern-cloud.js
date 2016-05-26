// This module modifies the configuration for using the testing framework with cloud platforms.

define(
    [
        'intern',   // public API for the testing framework itself
        './intern',  // base configuration
        'intern/dojo/text!../package.json'
    ],
    function (intern, config, pkgStr) {

        'use strict';

        var pkg = JSON.parse(pkgStr),
            build = 'UNKNOWN',
            project = pkg.name;

        if (intern.args.build) {
            build = intern.args.build;
        }
        // Make sure we are in Node and not a browser.
        else if (typeof process === 'object' && process && process.env) {
            build = process.env.BUILD || process.env.COMMIT;
        }

        // Setting properties on the config object here overrides the base configuration.
        // Best practice is to set only what needs to be different.

        // Miscellaneous configuration, mainly for Selenium.
        // Examples: https://code.google.com/p/selenium/wiki/DesiredCapabilities
        config.capabilities = config.capabilities || {};
        // BrowserStack-specific group for the build.
        config.capabilities.project = project;
        // Group for the test run, useful to map success history to code changes.
        config.capabilities.build = build;
        // Name of the test run, for logging purposes.
        config.capabilities.name = 'Developer Test - ' + project;

        // Places where unit and/or functional tests will be run.
        config.environments = [
            // BrowserStack-style...
            // Get latest: https://www.browserstack.com/automate/browsers.json
            // { os: "Windows", os_version: '7',          browser: 'ie',      browser_version: '10.0' },
            // { os: "Windows", os_version: '7',          browser: 'ie',      browser_version: '11.0' },
            // { os: 'Windows', os_version: '7',          browser: 'firefox', browser_version: '44.0' },
            // { os: 'Windows', os_version: '7',          browser: 'chrome',  browser_version: '48.0' },
            // { os: "Windows", os_version: '10',         browser: 'ie',      browser_version: '11.0' },
            // { os: 'Windows', os_version: '10',         browser: 'edge',    browser_version: '12.0' },
            // { os: 'Windows', os_version: '10',         browser: 'firefox', browser_version: '44.0' },
            // { os: 'Windows', os_version: '10',         browser: 'chrome',  browser_version: '48.0' },
            // { os: 'OS X',    os_version: 'El Capitan', browser: 'safari',  browser_version: '9.0' },
            // { os: 'OS X',    os_version: 'El Capitan', browser: 'firefox', browser_version: '44.0' },
            { os: 'OS X',    os_version: 'El Capitan', browser: 'chrome',  browser_version: '48.0' }
            // SauceLabs-style...
            // { platform: 'Windows 10', browserName: 'internet explorer', version: '11' },
            // { platform: 'Windows 10', browserName: 'firefox',           version: '44' },
            // { platform: 'Windows 10', browserName: 'chrome',            version: '48' },
            // { platform: 'OS X 10.11', browserName: 'safari',            version: '9' },
            // { platform: 'OS X 10.11', browserName: 'firefox',           version: '44' },
            // { platform: 'OS X 10.11', browserName: 'chrome',            version: '48' }
        ];

        // How many browsers may be open at once.
        config.maxConcurrency = 3;

        // Each cloud testing service has their own weird quirks and different APIs,
        // so load up the necessary configuration to talk to them.
        // config.tunnel = 'NullTunnel';         // no tunnel (default, if none provided)
        config.tunnel = 'BrowserStackTunnel';
        // config.tunnel = 'SauceLabsTunnel';
        // config.tunnel = 'TestingBotTunnel';
        config.tunnelOptions = {
            // host: 'localhost:4447',  // custom location to find the selenium server
            // verbose: true            // more logging, only supported by BrowserStack
        };

        // These are unit tests, which check the APIs of our app.
        // config.suites = [
        //     'test/unit/common'
        // ];
        // These are functional tests, which check the user-facing behavior of our app.
        // config.functionalSuites = [

        // ];

        // Test whitelist regex. Only test IDs ('suite name - test name')
        // that match this pattern will run, all others will be skipped.
        // config.grep = /.*/;

        // The paths that match this regex will NOT be included in code coverage reports.
        // config.excludeInstrumentation = /^(?:config|test|node_modules)\//;

        // Provide the modified settings.
        return config;
    }
);
