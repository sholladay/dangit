// This module defines the configuration for the testing framework, as used in CI.

define(
    [
        // Base configuration.
        './intern-cloud'
    ],
    function (config) {

        'use strict';

        // Setting properties on the config object here overrides the base configuration.
        // Best practice is to set only what needs to be different.

        // Replace the first word of the test run name with "CI",
        // to indicate that the test was triggered by CI and not
        // a developer.
        config.capabilities.name = config.capabilities.name.replace(
            /^.+?(?=\s)/, 'CI'
        );

        return config;
    }
);
