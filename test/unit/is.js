// If it starts with *is*, then it's tested here.

define(
    [
        'intern!tdd',
        'intern/chai!assert',
        'dangit/index.js'
    ],
    function (tdd, assert, lib) {

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
                    const actual = whatis(types[expected]);
                    assert.strictEqual(actual, expected);
                });
            });
        });
    }
);
