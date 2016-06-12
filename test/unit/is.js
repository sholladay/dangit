// If it starts with *is*, then it's tested here.

define(
    [
        'intern!tdd',
        'intern/chai!assert',
        'dangit'
    ],
    (tdd, assert, dangit) => {

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
                    'object'    : {},
                    'string'    : 'hi',
                    'regexp'    : /foo/,
                    'function'  : () => {},
                    'promise'   : Promise.resolve(),
                    'math'      : Math,
                    'symbol'    : Symbol(),
                    'date'      : new Date(),
                    'map'       : new Map(),
                    'set'       : new Set(),
                    'error'     : new TypeError(),
                    'int8array' : new Int8Array()
                };

                Object.keys(types).forEach((expected) => {
                    const actual = dangit.whatis(types[expected]);
                    assert.strictEqual(actual, expected);
                });
            });

            test('.whatis() has opt-out case normalization', function () {

                const {whatis} = dangit;

                assert.strictEqual(whatis(new Int8Array()), 'int8array');
                assert.strictEqual(whatis(new Int8Array(), undefined), 'int8array');
                assert.strictEqual(whatis(new Int8Array(), true), 'int8array');
                assert.strictEqual(whatis(new Int8Array(), false), 'Int8Array');
            });

            test('.describe() returns valid patterns', function () {

                // Here, the key is what we expect back from whatis()
                // and the property value is the input.
                const types = {
                    'Null'       : null,
                    'Undefined'  : undefined,
                    'Boolean'    : false,
                    'Number'     : 0,
                    'Array'      : [],
                    'Object'     : {},
                    'String'     : 'hi',
                    'Reg Exp'    : /foo/,
                    'Function'   : () => {},
                    'Promise'    : Promise.resolve(),
                    'Math'       : Math,
                    'Symbol'     : Symbol(),
                    'Date'       : new Date(),
                    'Map'        : new Map(),
                    'Set'        : new Set(),
                    'Error'      : new TypeError(),
                    'Int8 Array' : new Int8Array()
                };

                Object.keys(types).forEach((expected) => {
                    const actual = dangit.describe(types[expected]);
                    assert.strictEqual(actual, expected);
                });
            });

            test('.isNative() knows if a function is native', function () {

                const {isNative} = dangit;

                assert.isUndefined(isNative(''));
                assert.isUndefined(isNative({}));
                assert.isUndefined(isNative([]));
                assert.isUndefined(isNative(new Object()));

                assert.isTrue(isNative(console.log));
                assert.isTrue(isNative(console.info));
                assert.isTrue(isNative(console.debug));
                assert.isTrue(isNative(console.warn));
                assert.isTrue(isNative(console.error));
                assert.isTrue(isNative(console.trace));
                assert.isTrue(isNative(console.time));
                assert.isTrue(isNative(console.timeEnd));
                assert.isTrue(isNative(Object));
                assert.isTrue(isNative(Object.prototype.hasOwnProperty));
                assert.isTrue(isNative(Object.prototype.toString));
                assert.isTrue(isNative(Object.prototype.constructor));
                assert.isTrue(isNative(Object.prototype.valueOf));
                assert.isTrue(isNative(Object.prototype.isPrototypeOf));
                assert.isTrue(isNative(Function));
                assert.isTrue(isNative(Function.prototype.bind));
                assert.isTrue(isNative(Function.prototype.call));
                assert.isTrue(isNative(Function.prototype.apply));

                assert.isFalse(isNative(() => {}));
                assert.isFalse(isNative(new Function()));
                assert.isFalse(isNative(function () {}));
                assert.isFalse(isNative(function () {'native code'}));
                assert.isFalse(isNative(function () {' native code '}));
                assert.isFalse(isNative(function () { 'native code' }));
                assert.isFalse(isNative(function () { ' native code ' }));
                assert.isFalse(isNative(function () {'[native code]'}));
                assert.isFalse(isNative(function () {' [native code] '}));
                assert.isFalse(isNative(function () { '[native code]' }));
                assert.isFalse(isNative(function () { ' [native code] ' }));
                assert.isFalse(isNative(function () {/*native code*/}));
                assert.isFalse(isNative(function () {/* native code */}));
                assert.isFalse(isNative(function () { /*native code*/ }));
                assert.isFalse(isNative(function () { /* native code */ }));
                assert.isFalse(isNative(function () {/*[native code]*/}));
                assert.isFalse(isNative(function () {/* [native code] */}));
                assert.isFalse(isNative(function () { /*[native code]*/ }));
                assert.isFalse(isNative(function () { /* [native code] */ }));
                assert.isFalse(isNative(function () {
                    // native code
                }));
                assert.isFalse(isNative(function () {
                    // [native code]
                }));
            });

            test('.isTheGlobalObject() is environment agnostic', function () {

                const imposter = {
                    Infinity,
                    NaN,
                    undefined,
                    Object,
                    String,
                    Number,
                    Boolean,
                    Function,
                    Array,
                    Symbol,
                    Map,
                    Set,
                    WeakSet,
                    RegExp,
                    Promise,
                    Reflect,
                    Date,
                    Error,
                    Math,
                    JSON,
                    setTimeout,
                    clearTimeout,
                    setInterval,
                    clearInterval,
                    decodeURI,
                    decodeURIComponent,
                    encodeURI,
                    encodeURIComponent,
                    top    : typeof top === 'object' && top ? top : {},
                    self   : typeof self === 'object' && self ? self : {},
                    window : typeof window === 'object' && window ? window : {},
                    global : typeof global === 'object' && global ? global : {}
                };

                const {isTheGlobalObject} = dangit;

                assert.isFalse(isTheGlobalObject({}));
                assert.isFalse(isTheGlobalObject(imposter));
                assert.isFalse(isTheGlobalObject(function Window() {}));
                assert.isFalse(isTheGlobalObject(function Global() {}));
                assert.isFalse(isTheGlobalObject(function window() {}));
                assert.isFalse(isTheGlobalObject(function global() {}));

                assert.isTrue(isTheGlobalObject(
                    typeof global === 'object' && global ? global :
                    typeof window === 'object' && window ? window :
                    false
                ));
            });
        });
    }
);
