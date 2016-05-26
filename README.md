# dangit [![Build status for dangit on Codeship.](https://img.shields.io/codeship/54787680-bd3b-0132-ea67-02fb30cbf240/master.svg "Codeship Build Status")](https://codeship.com/projects/72554 "Dangit Builds")

> A utility library for random JavaScript quirks.

## Why?

 - Validate user input.
 - Get the global object in any environment.
 - Create namespaces non-destructively.
 - See if native APIs have been modified.

## Install

```sh
npm install dangit --save
```

## Usage

Get it into your program.

```js
const dangit = require('dangit');
```

In a browser:

```js
const dangit = window.dangit;
```

Retrieve the [true type](https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/ "Explanation of type checking in JavaScript and the internal class property.") of any input, as a lowercase string.

```js
const input = null;
dangit.whatis(input);  // => "null"
```

But why type all that and still have to do a [strict equality check](http://www.impressivewebs.com/why-use-triple-equals-javascipt/ "Explanation of why you should always use triple equals over double equals in JavaScript.")? Fuggedaboutit.

```js
const input = null;
dangit.isNull(input);  // => true
```

Congrate, you saved 3 characters over `typeof` **and** you weren't lied to.

Another benefit is more intuitive [operator precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence "Explanation of the priority level of different operators in JavaScript.").

Next let's get the ever present [global object](http://stackoverflow.com/questions/3277182/how-to-get-the-global-object-in-javascript "StackOverflow question about getting the global object, with excellent answers detailing the pitfalls of various approaches to accessing it.").

```js
dangit.getTheGlobalObject();  // => window in browsers, global in Node.js, etc.
```

It's a smarty pants function and won't get tricked as easily as you may think.

```js
// Anywhere in Node.js.
const window = {};
dangit.getTheGlobalObject() === window;  // => false
```

or...

```js
// Anywhere in a browser.
const global = {};
dangit.getTheGlobalObject() === global;  // => false
```

Isn't that warm and cozy? Just look at it.

Another common task is to construct an API namespace. Let's do that.

```js
const ns = dangit.namespace('superb.llamas');  // => returns a namespaced global object
```

or if you already have something to extend...

```js
const
    x = { y:{} },
    z = x.y,
    ns = dangit.namespace(z, 'pirates.forever');  // => returns a new object, which is only global if z was
```

Notes:
 - It is destructive by default in that if any part of the chain is not a truthy object or function, it has to overwrite that property with a new object to keep going. But...
 - If you pass `false` as the last argument, it will turn off force mode, throwing an error instead. And...
 - It will never destroy anything it doesn't have to.
 - To protect you from yourself, it only ever considers an object's [own properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain "Explanation of inheritance and the prototype chain in JavaScript."). An API without this restriction would be easy, [file an issue](https://github.com/sholladay/dangit/issues "File an issue with the project.") if you want it.

Once you've got a namespace, you could really use some ninjas to help solve that issue where you want everything to be coerced to an easy-to-process list. Or a unicorn - that would do nicely, too.

```js
function dream() {
    const args = dangit.flatten(arguments);
    console.log(args.join(' ') + ', whatever');
}
dream(['people', ['pass'], ['weird']], 'stuff')  // => "people pass weird stuff, whatever"
```

Yeah that's basically a real actual, magical unicorn for your APIs.

Who cares if they used `querySelector` or `querySelectorAll`, just flatten and process whatever you get the same way, 100% of the time.

So then you've got your cool new 3rd party JavaScript library and you find out your logger doesn't work on some website because they decided to prevent developers from accidentally being [noisy in production](http://stackoverflow.com/questions/7042611/override-console-log-for-production "Example of a developer wanting to overwrite the console methods in production.").

```js
dangit.isNative(console.log);  // => true only if it hasn't been overwritten
console.log = function () {};
dangit.isNative(console.log);  // => false
```

Note: This only works for functions and does not guarantee their properties are intact, [file an issue](https://github.com/sholladay/dangit/issues "File an issue with the project.") if you want more.

And if you really flippin' want the console back, we've got some hacks up our sleeve.

```js
dangit.resetConsole()
```

So now you want to figure out if it makes sense to loop over some input. It could be a NodeList, HTMLCollection, a plain old array, or something far more devious.

```js
let input = 'abc';
dangit.isArrayish(input);  // => false, even though it has a length of 3
input = function (a, b) {};
dangit.isArrayish(input);  // => false, even though it has a length of 2
input = document.querySelectorAll('a');
dangit.isArrayish(input);  // => true, even though it is not a typical array
```

Then you encounter some ES5 *interestingness* where properties [aren't allowed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze "Documentation for Object.freeze(), which prevents most changes to an object.") to be modified. Eventually you discover `Object.isFrozen` which is supposed to help you plan for this, but it throws errors for half the input in the galaxy.

```js
const input = null;
console.log(typeof input);  // => "object"
Object.isFrozen(undefined)  // => Uncaught TypeError: Object.isFrozen called on non-object
dangit.isFrozen()           // => false
```

After tooling up to process input, you'll come across situations where you need to provide defaults or keep track of state during asynchronous tasks. Do this by stamping a new object with a bunch of properties.

```js
const
    keys   = ['a', 'b', 'c', 'd'],
    values = false;
dangit.stampObject(keys, values);  // => {a: false, b: false, c: false, d: false}
```

You can provide either argument as a simple value or an array-like object, they will be flattened. Values will be used until there's no more left, at which point the last one will become sticky.

```js
const
    keys   = ['a', ['b', 'c'], 'd'],
    values = [false, true];
dangit.stampObject(keys, values);  // => {a: false, b: true, c: true, d: true}
```

And also...

```js
const
    keys   = ['a', 'b', 'c', 'd'],
    values = [false, 1, 1, true, 6, 'moo' ];  // it is safe to over-provide
dangit.stampObject(keys, values);  // => {a: false, b: 1, c: 1, d: true}
```

Do some stuff with that stamp, then when the time is right, make sure the results were what you expected.

```js
const
    keys   = ['a', 'b', 'c', 'd'],
    values = false,
    stamp  = dangit.stampObject(keys, values);  // => {a: false, b: false, c: false, d: false}
// ... do async stuff with each, set to true when complete ...
// ... then, later...
dangit.checkStamp(stamp, true);  // => true
```

Note: Due to the [non-guaranteed order](http://stackoverflow.com/questions/5525795/does-javascript-guarantee-object-property-order "Explanation of the order objects are enumerated in and why.") of enumerating objects, this is not quite like `.stampObject()` - it can only take a simple value to check for an entire object. To compensate a bit, it does **non-strict** equality checking by default, with a third boolean argument for making it strict. [File an issue](https://github.com/sholladay/dangit/issues "File an issue with the project.") if you want more.

Another task that could be simpler is processing a bunch of configuration just to ignore certain parts of it. We've got that covered, too.

```js
function makeUrl(customer, mediaType, file) {
    return dangit.joinTruthy(
        { separator : '/' },
        '//mysite.com',
        customer,
        mediaType,
        file
    );
}
makeUrl('steve', 'img', 'funny.jpg');  // => '//mysite.com/steve/img/funny.jpg'
makeUrl('jane', false, 'config.js');  // => '//mysite.com/jane/config.js'
```

## Contributing

See our [contributing guidelines](https://github.com/sholladay/dangit/blob/master/CONTRIBUTING.md "The guidelines for participating in this project.") for more details.

1. [Fork it](https://github.com/sholladay/dangit/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/dangit/compare "Submit code to this project for review.").

## License

[MPL-2.0](https://github.com/sholladay/dangit/blob/master/LICENSE "The license for dangit.") © [Seth Holladay](http://seth-holladay.com "Author of dangit.")

Go make something, dang it.
