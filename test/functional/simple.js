// This is an example of a functional test, in case
// we ever need it.

define(
    [
        'intern!tdd',                      // the testing interface - defines how we register suites and tests
        'intern/chai!assert',              // helps throw errors to fail tests, based on conditions
        'intern/dojo/node!leadfoot/keys',  // unicode string constants used to control the keyboard
        'intern/dojo/node!fs',             // Node's filesystem API, used to save screenshots
        'intern/dojo/node!leadfoot/helpers/pollUntil'  // utility to pause until an expression is truthy
    ],
    function (tdd, assert, keys, fs, pollUntil) {

        var url = 'http://dangit.com';

        with (tdd) {
            suite('Some Use Case', function () {

                before(  // code to run when the suite starts, before tests
                    function () {
                    }
                )
                beforeEach( // code to run before each test, including the first one
                    function () {
                    }
                )
                afterEach( // code to run after each test, including the last one
                    function () {
                    }
                );
                after(  // code to run after all tests, before the suite exits
                    function () {
                    }
                );

                test('Some Cool Task', function () {

                    var selector = 'p',
                        originalText;

                    return this.remote               // represents the browser being tested
                        .maximizeWindow()            // best effort to normalize window sizes (not every browser opens the same)
                        .get(url)                    // navigate to the desired page
                        .setFindTimeout(6000)        // fail test if any find method can't succeed this quickly
                        .findById('something-cool')  // finding this is our sign that the page is loaded and ready
                            .pressKeys(keys.ADD)     // unicode for: hit the + key!
                            .pressKeys(keys.ADD)
                            .end()                   // get out of the current element context
                        .sleep(2200)                 // wait for a specific number of milliseconds
                        .execute(                    // run the given code in the remote browser
                            function (selector) {
                                something.fun(selector);
                            },
                            [selector]                 // list of arguments passed to the remote code
                        )
                        .findByCssSelector(selector)
                            .getVisibleText()
                            .then(function (text) {
                                originalText = text;
                            })
                            .pressKeys(keys.SPACE)   // hit the spacebar, to do something
                            .end()
                        .setFindTimeout(2000)        // set the find timeout to be more strict
                        .findById('something-cool')  // find something
                            .getVisibleText()
                            .then(function (text) {
                                assert.strictEqual(
                                    text,
                                    originalText,
                                    'The text must remain the same.'  // justification of test
                                );
                            });
                });

                /////////////////////////////// ------- test boundary -------

                test('Something Visual', function () {

                    var canDoScreenshot = this.remote.session.capabilities.takesScreenshot;

                    return this.remote  // represents the browser being tested
                        .then(
                            function () {
                                if (canDoScreenshot) {
                                    this.takeScreenshot()
                                        .then(
                                            function (image) {
                                                fs.writeFileSync(
                                                    '~/Desktop/myfile' + Date.now() + '.png',
                                                    image
                                                );
                                            }
                                        )
                                }
                            }
                        )
                });
            });
        }
    }
);
