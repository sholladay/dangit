// NOTE: This file is essentially a utility, it constructs and returns
// lists of test suite module IDs for test automation

define(
    [   // dependencies...
        './unit',
        './functional'
    ],
    function (unitSuites, functionalSuites) {

        // Prepend each test suite with its directory name, to make
        // them proper module IDs as the testing system expects

        function prependDir(dir, list) {
            if (list && typeof list === 'object' && list.length > 0) {
                for (i = 0, len = list.length; i < len; i = i + 1) {
                    list[i] = dir + '/' + list[i];
                }
            }
            return list;
        }

        return {
            unit       : prependDir('unit', unitSuites),
            functional : prependDir('functional', functionalSuites)
        };
    }
)
