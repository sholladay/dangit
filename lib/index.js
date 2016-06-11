((define) => {define((require) => {

    'use strict';

    function whatis(obj, lowerCase) {

        // This function is designed to get more information about an object
        // than typeof or instanceof, etc. by checking its class.

        // Step 1: Grab the purest toString method we can and call it with the
        //         passed-in object used as its internal 'this' reference.
        // Step 2: Take the string, which should look like '[object Whatever]'
        //         and extract only letters after the first space.
        // Step 3: Take the string, which should now be the object's true type
        //         and normalize it to lower case, if desired.

        let result = Object.prototype.toString.call(obj).match(/ (.+?)]/)[1];

        if (lowerCase || typeof lowerCase === 'undefined') {
            result = result.toLowerCase();
        }

        return result;
    }

    function describe(obj, lowerCase) {

        // This function is designed to return a human friendly version of an object's class.

        if (typeof lowerCase === 'undefined') {
            lowerCase = false;
        }

        return whatis(obj, lowerCase).replace(/(?=[A-Z][a-z])/g, ' ').trim();
    }

    // Check if a function is native, which is useful to ensure that an
    // API like console.log has not been overwritten.
    function isNative(context) {

        // The trick we use to determine if the input is native
        // only works on functions.
        if (typeof context !== 'function') {
            return;
        }

        // Grab the purest toString method we can, and call it with the desired
        // context used as its internal 'this' reference. The regex takes into
        // account browser quirks which output the string differently.

        // A previous, less strict version.
        // /^\s*?function(?:\s+?.*?|\s*?)\(.*?\)\s*?\{\s*?\[native\s*?code\]/i
        return /^function .*?\(.*?\)\s*?\{\s*?\[native code\]/.test(
            Function.prototype.toString.call(context)
        );
    }

    function isTheGlobalObject(obj) {

        const objType = whatis(obj);

        // Chrome, Opera, Node.js say 'global' ... IE, FF, Safari, others say 'window'
        return objType === 'global' || objType === 'window';
    }

    function isSpeechSynthesisUtterace(obj) {
        return whatis(obj) === 'speechsynthesisutterance';
    }

    function isFunction(obj) {
        return typeof obj === 'function';
    }

    function isPlainObject(obj) {
        return whatis(obj) === 'object';
    }

    function isNull(obj) {
        return whatis(obj) === 'null';
    }

    function isRegExp(obj) {
        return whatis(obj) === 'regexp';
    }

    function isNumber(obj) {
        return whatis(obj) === 'number';
    }

    function isDate(obj) {
        return whatis(obj) === 'date';
    }

    function isMath(obj) {
        return whatis(obj) === 'math';
    }

    function isArray(obj) {
        return whatis(obj) === 'array';
    }

    function isArrayish(obj) {

        const objType = typeof obj;

        if (obj && typeof obj.length === 'number' && objType !== 'string' && objType !== 'function') {
            return true;
        }

        return false;
    }

    function isDeep(obj) {

        // This function determines whether an object has depth,
        // as in whether or not it contains something.

        if (!obj) {
            return false;
        }
        else if (isArrayish(obj)) {
            // If it's array-like, only consider the proclaimed length...
            return obj.length > 0;
        }
        else if (typeof obj === 'object') {
            // For everything else, consider all enumerable properties...
            return Object.keys(obj).length > 0;
        }

        return false;
    }

    function isConsole(obj) {
        return whatis(obj) === 'console';
    }

    function isElement(obj) {

        // This function is designed to tell if its input is a DOM element,
        // in a much more robust way than standard (quack!) techiques.

        return /html\w+element/.test(whatis(obj));
    }

    function isElementList(obj) {

        const objType = whatis(obj);

        // No matter what, it has to be truthy.
        if (!obj) {
            return false;
        }
        else if (objType === 'nodelist' || objType === 'htmlcollection') {
            return true;
        }
        else if (isArrayish(obj)) {

            // Empty lists cannot be full of elements.
            if (obj.length < 1) {
                return false;
            }

            let i = obj.length;
            while (i--) {
                if (!isElement(obj[i])) {
                    return false;
                }
            }

            return true;
        }
        else if (typeof obj === 'object') {
            // As a last resort, inspect all enumerable own properties.
            const keys = Object.keys(obj);
            // Objects with no keys cannot be full of elements.
            if (keys.length > 0) {
                // FYI: .every() always returns true for empty lists
                return keys.every((key) => {
                    return isElement(obj[key]);
                });
            }
        }

        return false;
    }

    function isExtendableType(obj) {

        // Answers the question: would it make sense to add a property directly to this object?

        const objType = typeof obj;

        if (obj && (objType === 'object' || objType === 'function')) {
            return true;
        }

        return false;
    }

    function isExtensible(obj) {

        // Wrapper for Object.isExtensible, for when throwing errors is undesireable.

        if (isExtendableType(obj)) {
            return Object.isExtensible(obj);
        }

        return false;
    }

    function isFrozen(obj) {

        // Wrapper for Object.isFrozen, for when throwing errors is undesireable.

        if (isExtendableType(obj)) {
            return Object.isFrozen(obj);
        }

        return false;
    }

    function isSealed(obj) {

        // Wrapper for Object.isSealed, for when throwing errors is undesireable.

        if (isExtendableType(obj)) {
            return Object.isSealed(obj);
        }

        return false;
    }

    function toArray() {

        // This function is designed to behave exactly like Array.prototype.concat()
        // except it does what you would expect when giving it an arguments object.

        var queue = Array.prototype.slice.call(arguments),  // convert to true array
            item, i, len, result = [];

        // if the queue is not empty, keep going...
        while (queue.length > 0) {
            // TODO: Stop being shifty, just basic loop.
            item = queue.shift();  // get and remove the first value from the queue
            // detect array-like objects and treat them special...
            if (isArrayish(item)) {
                len = item.length;
                i = 0;
                while (i < len) {
                    // add the array's children to the beginning of the child
                    // to keep their order intact...
                    result.push(item[i]);
                    i = i + 1;
                }
            }
            // the current item has no depth we wish to traverse, so add it to the result list...
            else {
                result.push(item);
            }
        }

        return result;
    }

    function flatten() {

        // This function is designed to deep copy all arguments into
        // a new, single-level array. It remains generic by only

        var queue = Array.prototype.slice.call(arguments),  // convert to true array
            item, i, result = [];

        // if the queue is not empty, keep going...
        while (queue.length > 0) {
            item = queue.shift();  // get and remove the first value from the queue
            // detect array-like objects and treat them special...
            if (isArrayish(item)) {
                i = item.length;
                // now we do a reverse loop if the array is non-empty...
                while (i--) {
                    // add the array's children to the beginning of the queue
                    // to keep their order intact...
                    queue.unshift(item[i]);
                }
            }
            // the current item has no depth we wish to traverse, so add it to the result list...
            else {
                result.push(item);
            }
        }

        return result;
    }

    // TODO: Make a function that will flatten objects as well

    function getTheGlobalObject() {

        // NOTE: The typeof checks here are solely to avoid a ReferenceError being thrown.
        /*jshint validthis:true */
        if (typeof this === 'object' && isTheGlobalObject(this)) {
            return this;
        }
        else if (typeof window === 'object' && isTheGlobalObject(window)) {
            return window;
        }
        else if (typeof global === 'object' && isTheGlobalObject(global)) {
            return global;
        }
    }

    // namespace('foo') // returns window.foo or {}.foo
    // namespace(myObj, 'hello.foo') // returns myObj.hello.foo
    function namespace() {

        // This function is designed to take

        var defaultBase  = getTheGlobalObject() || {},
            defaultForce = true,
            args         = flatten(arguments),
            argsLen      = args.length,
            firstArg     = args[0],
            lastArg      = args[argsLen - 1],  // undefined is ok here, it can be filtered later
            base         = isExtendableType(firstArg) ? firstArg : defaultBase,  // the object to extend
            force        = typeof lastArg === 'boolean' ? lastArg : defaultForce,
            separator    = '.',  // the semantic fencepost for namespaces
            findSeparators = new RegExp('\\' + separator + '+', 'gi'),  // match chains of at least one seperator
            filtered     = args.filter(
                function isUsableNamespace(item) {
                    // filter which returns true if an argument is eligible to be used as a namespace
                    // keep in mind its .toString() will be called when setting it as a property
                    return typeof item === 'string' || typeof item === 'number';
                }
            ),
            sanitized    = filtered.join(separator).replace(findSeparators, separator),
            parts        = sanitized.split(separator),
            i, len = parts.length, result = base;

        // the act of joining and then splitting an array will never result in an empty array,
        // even if the original was empty, so we need to check that we have not accidentally
        // inserted data for us to loop over...
        if (len > 0 && filtered.length > 0) {
            for (i = 0; i < len; i = i + 1) {
                if (Object.prototype.hasOwnProperty.call(base, parts[i]) && isExtendableType(base[parts[i]])) {
                    base = base[parts[i]];
                }
                else if (force) {
                    base = base[parts[i]] = {};
                }
                else {
                    throw new TypeError(
                        'Unable to access \"' + parts[i] + '\" of \"' + sanitized + '\" without force mode. ' +
                        'Must be a truthy object or function and an own property.'
                    );

                    // FYI, in case the above throw is ever removed, we still want to break the loop here...
                    // break;  // this causes the base to be the deepest usable object in the chain
                }
            }
            result = base;
        }

        return result;
    }

    function resetConsole() {

        // Some sites wipe out the console functions to prevent developers from
        // putting such statements in production, so let's get it back.

        // TODO: Figure out how to make this work in Node.js,
        //       where whatis(console) returns "console"

        var property;

        // Step 1 - Handle cases where they create a new object with explicit
        // info, log, warn, (etc.) functions and assign that to window.console
        if (!isConsole(window.console)) {
            delete window.console;
        }

        // Step 2 - Handle cases where they assign empty functions in a loop
        // through console's properties, which come back to life like zombies
        // even after Step 1.
        // Both of these are necessary and in this order! Neither takes care of both.
        for (property in window.console) {
            // do NOT do an if hasOwnProperty check here, we need
            // properties from up the prototype chain...
            if (isNative(window.console[property]) === false) {
                delete window.console[property];
            }
        }

        // at this point, the important functions should be automatically re-created...

    }

    function samePolarity() {

        var i, result;

        // At least two arguments must be provided to compare.
        if ((i = arguments.length) > 1) {

            // If the polarity of the first list item is truthy, then
            // some argument must be falsey to prove there are
            // different polarities, otherwise, an argument
            // being truthy proves it, too.

            // Performance optimization: ask ourselves the polarity of
            // the first list item before we begin looping, to avoid
            // doing so inside the loop.

            // TODO: Test the while loop approach vs .every() here.

            result = true;  // assume success

            if (arguments[0]) {
                while (i--) {
                    if (!arguments[i]) {
                        result = false;  // we have proven non-same polarity
                        break;
                    }
                }
            }
            else {
                while (i--) {
                    if (arguments[i]) {
                        result = false;  // we have proven non-same polarity
                        break;
                    }
                }
            }
        }

        return result;
    }

    // TODO: Create function stampArray() API

    // TODO: Create function stamp() and make stampObject and stampArray abstract it

    function stampObject(keys, values) {

        // This function is designed to return a new object with identical values
        // for all property names provided

        var i, len, value, lastValueIndex, result = {};

        // If the user does not provide any useful data...
        if (arguments.length < 1) {
            // Just give back an empty object...
            return result;
        }

        keys   = flatten(keys);    // get a single-level array of all property names to stamp
        values = flatten(values);

        len = keys.length;
        lastValueIndex = values.length - 1;  // we use this to avoid iterating past a sensible index

        i = 0;
        while (i < len) {
            // Extract a value from the list between its first and last index,
            // but as close as possible to the current loop iteration...
            value = values[Math.max(Math.min(i, lastValueIndex), 0)];

            result[keys[i]] = value;
            i = i + 1;
        }

        return result;
    }

    function checkStamp(stamp, value, strict) {

        // This function is designed to take an object for inspection and
        // return whether all of its properties match a given value.

        var keys, i, result;

        // No matter what, it has to be truthy...
        if (!stamp) {
            return;
        }
        else if (isArrayish(stamp)) {
            // For arrays-like objects, we only consider their numerical indexes...
            i = stamp.length;
            result = true;  // we assume success and then try to disprove it
            while (i--) {
                // By default, strict is falsey and we convert both the target property
                // and the desired value to booleans before comparing them...
                if (strict ? (stamp[i] !== value) : !samePolarity(stamp[i], value)) {
                    result = false;
                    break;
                }
            }
        }
        else if (isExtendableType(stamp)) {
            // For other objects that may have them, we consider all enumerable properties...
            keys = Object.keys(stamp);
            i = keys.length;
            result = true;  // we assume success and then try to disprove it
            while (i--) {
                // by default, strict is falsey and we convert both the target property
                // and the desired value to booleans before comparing them...
                if (strict ? (stamp[keys[i]] !== value) : !samePolarity(stamp[keys[i]], value)) {
                    result = false;
                    break;
                }
            }
        }

        return result;
    }

    function join(options) {

        // This function is designed to make a string, with optional separators,
        // from all arguments of a certain polarity. Useful for paths, etc.

        var i, separator, polarity, surround, alwaysAllow,
            firstToken = true,
            start      = 0,
            len        = arguments.length,
            result     = '';

        if (options && typeof options === 'object') {
            // Make sure the options are ignored while joining the arguments.
            start     = 1;
            separator = options.separator;  // when joining, add this between each token
            polarity  = options.polarity;   // only keep tokens of this truthy/falsey state
            surround  = options.surround;   // after joining, place this token on either side
        }
        // The polarity setting acts like a per-argument filter and by default
        // we don't want to filter at all, just join everything.
        alwaysAllow = typeof polarity === 'undefined';

        if (separator) {
            if (alwaysAllow) {
                for (i = start; i < len; i = i + 1) {
                    if (firstToken) {
                        firstToken = !firstToken;
                    }
                    else {
                        result = result + separator;
                    }
                    result = result + arguments[i];
                }
            }
            else if (polarity) {
                for (i = start; i < len; i = i + 1) {
                    if (arguments[i]) {
                        if (firstToken) {
                            firstToken = !firstToken;
                        }
                        else {
                            result = result + separator;
                        }
                        result = result + arguments[i];
                    }
                }
            }
            else {
                for (i = start; i < len; i = i + 1) {
                    if (!arguments[i]) {
                        if (firstToken) {
                            firstToken = !firstToken;
                        }
                        else {
                            result = result + separator;
                        }
                        result = result + arguments[i];
                    }
                }
            }
        }
        else {
            if (alwaysAllow) {
                for (i = start; i < len; i = i + 1) {
                    result = result + arguments[i];
                }
            }
            else if (polarity) {
                for (i = start; i < len; i = i + 1) {
                    if (arguments[i]) {
                        result = result + arguments[i];
                    }
                }
            }
            else {
                for (i = start; i < len; i = i + 1) {
                    if (!arguments[i]) {
                        result = result + arguments[i];
                    }
                }
            }
        }

        if (surround) {
            result = surround + result + surround;
        }

        return result;
    }

    function joinTruthy(options) {

        // This function is designed to conveniently join
        // all arguments that are truthy, which is useful
        // for constructing URLs and other data based on
        // simple arguments, without complicated logic.

        let opts, start;

        if (options && typeof options === 'object') {
            opts = Object.create(options);
            start = 1;
        }
        else {
            opts = {};
            start = 0;
        }
        // Only care about truthy arguments.
        opts.polarity = true;

        // Only the non-option args.
        const args = Array.prototype.slice.call(arguments, start);
        // Add the modified options.
        args.unshift(opts);

        return join.apply(undefined, args);
    }

    function space(options) {

        // This function is designed to conveniently join
        // all arguments with a space, which is common
        // for making sentences or shell commands.

        let opts, start;

        if (options && typeof options === 'object') {
            opts = Object.create(options);
            start = 1;
        }
        else {
            opts = {};
            start = 0;
        }
        // Format arguments for sentences, command line tools, etc.
        opts.separator = ' ';

        // Only the non-option args.
        const args = Array.prototype.slice.call(arguments, start);
        // Add the modified options.
        args.unshift(opts);

        return join.apply(undefined, args);
    }

    function spaceTruthy(options) {

        // This function is designed to conveniently join
        // all arguments with a space, which is common
        // for making sentences or shell commands.

        let opts, start;

        if (options && typeof options === 'object') {
            opts = Object.create(options);
            start = 1;
        }
        else {
            opts = {};
            start = 0;
        }
        // Only care about truthy arguments.
        opts.polarity = true;
        // Format arguments for sentences, command line tools, etc.
        opts.separator = ' ';

        // Only the non-option args.
        const args = Array.prototype.slice.call(arguments, start);
        // Add the modified options.
        args.unshift(opts);

        return join.apply(undefined, args);
    }

    function quote(options) {

        // This function is designed to conveniently join
        // and then quote all arguments, which is common
        // for making sentences or shell commands.

        let opts, start;

        if (options && typeof options === 'object') {
            opts = Object.create(options);
            start = 1;
        }
        else {
            opts = {};
            start = 0;
        }
        // Format arguments for sentences, command line tools, etc.
        opts.surround = '\"';

        // Only the non-option args.
        const args = Array.prototype.slice.call(arguments, start);
        // Add the modified options.
        args.unshift(opts);

        return join.apply(undefined, args);
    }

    function quoteTruthy(options) {

        // This function is designed to conveniently join
        // and then quote all arguments, which is common
        // for making sentences or shell commands.

        let opts, start;

        if (options && typeof options === 'object') {
            opts = Object.create(options);
            start = 1;
        }
        else {
            opts = {};
            start = 0;
        }
        // Only care about truthy arguments.
        opts.polarity = true;
        // Format arguments for sentences, command line tools, etc.
        opts.surround = '\"';

        // Only the non-option args.
        const args = Array.prototype.slice.call(arguments, start);
        // Add the modified options.
        args.unshift(opts);

        return join.apply(undefined, args);
    }

    function help() {

        // This function is designed to help inexperienced users
        // or remind people what they can do with the app.

        // TODO: Fix the case where this runs in Node.js and spews out garbage...
        console.log(
            '%cThe ' + appName + ' public API:',
            'background:blue;color:white;padding:4px 6px;border-radius:4px;line-height:' +
            '2em;font-weight:bold;font-family:Calibri;font-size:2vh;'
        );

        const
            keys = Object.keys(dangit),
            len  = keys.length;

        let i = 0;
        while (i < len) {
            let type = whatis(dangit[keys[i]]),
                symbol = '';
            if (type === 'function') {
                symbol = '()';
            }
            else if (type === 'object') {
                // just prettier output on the console...
                type = 'object  ';
            }
            else if (type === 'array') {
                symbol = '[]';
            }
            else if (type === 'string') {
                // just prettier output on the console...
                type = 'string  ';
            }
            console.log(`${type} : ${appName}.${keys[i]}${symbol}`);
            i += 1;
        }
    }

    return {
        whatis,
        describe,
        isNative,
        isTheGlobalObject,
        isSpeechSynthesisUtterace,
        isFunction,
        isPlainObject,
        isNull,
        isRegExp,
        isNumber,
        isDate,
        isMath,
        isConsole,
        isElement,
        isElementList,
        isArray,
        isArrayish,
        isDeep,
        isExtendableType,
        isExtensible,
        isFrozen,
        isSealed,
        toArray,
        flatten,
        getTheGlobalObject,
        namespace,
        resetConsole,
        stampObject,
        checkStamp,
        join,
        joinTruthy,
        space,
        spaceTruthy,
        quote,
        quoteTruthy,
        help
    };
});})( // Help Node out by setting up define.
    typeof module === 'object' && module.exports && typeof define !== 'function' ?
    (factory) => { module.exports = factory(require); } :
    define
);
