// If it starts with *is*, then it's tested here.

define(
    [
        'intern!tdd',
        'intern/chai!assert',
        'dangit'
    ],
    function (tdd, assert, dangit) {

        'use strict';

        const
            suite = tdd.suite,
            test  = tdd.test;

        suite('is', function () {

            test('.whatis() returns valid patterns', function () {

                // Here, the key is what we expect back from whatis()
                // and the property value is the input.
                const types = {
                    'null'      : null,
                    'undefined' : undefined,
                    'boolean'   : false,
                    'number'    : 0,
                    'array'     : [],
                    'object'    : {}
                };

                Object.keys(types).forEach((expected) => {
                    const actual = dangit.whatis(types[expected]);
                    assert.strictEqual(actual, expected);
                });
            });
        });
    }
);
