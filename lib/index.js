((define) => {define(() => {
    'use strict';

    // Get the true type / class of an object, to workaround reliability
    // problems with typeof and instanceof.
    const whatis = (obj, lowerCase) => {
        // Step 1: Grab the purest toString method we can and call it with the
        //         passed-in object used as its internal 'this' reference.
        // Step 2: Take the string, which should look like '[object Whatever]'
        //         and extract only characters after the first space.
        // Step 3: Take the string, which should now be the object's true type
        //         and normalize it to lower case, if desired.
        let result = Object.prototype.toString.call(obj).match(/ (.+?)]/)[1];

        if (lowerCase || typeof lowerCase === 'undefined') {
            result = result.toLowerCase();
        }

        return result;
    };

    // Get a human friendly version of an object's class.
    const describe = (obj) => {
        return whatis(obj, false).replace(/(?=[A-Z][a-z])/g, ' ').trimLeft();
    };

    // Check if a function is native, which is useful to ensure that an
    // API like console.log has not been overwritten.
    const isNative = (context) => {
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
    };

    const isTheGlobalObject = (obj) => {
        const objType = whatis(obj);
        // Chrome, Opera, Node.js say 'global' ... IE, FF, Safari, others say 'window'
        return objType === 'global' || objType === 'window';
    };

    const isSpeechSynthesisUtterace = (obj) => {
        return whatis(obj) === 'speechsynthesisutterance';
    };

    const isFunction = (obj) => {
        return typeof obj === 'function';
    };

    const isPlainObject = (obj) => {
        return whatis(obj) === 'object';
    };

    const isNull = (obj) => {
        return whatis(obj) === 'null';
    };

    const isRegExp = (obj) => {
        return whatis(obj) === 'regexp';
    };

    const isNumber = (obj) => {
        return whatis(obj) === 'number';
    };

    const isDate = (obj) => {
        return whatis(obj) === 'date';
    };

    const isMath = (obj) => {
        return whatis(obj) === 'math';
    };

    const isArray = (obj) => {
        return whatis(obj) === 'array';
    };

    const isArrayish = (obj) => {
        return Boolean(obj) && typeof obj === 'object' && typeof obj.length === 'number';
    };

    // Determines if an object has depth, as in whether or not
    // it contains something.
    const isDeep = (obj) => {
        if (isArrayish(obj)) {
            // If it's array-like, only consider the proclaimed length...
            return obj.length > 0;
        }
        else if (obj && typeof obj === 'object') {
            // For everything else, consider all enumerable properties...
            return Object.keys(obj).length > 0;
        }

        return false;
    };

    const isConsole = (obj) => {
        return whatis(obj) === 'console';
    };

    // Determine whether an object is a DOM element, in a much more robust way
    // than standard (quack!) techiques.
    const isElement = (obj) => {
        return /html\w+element/.test(whatis(obj));
    };

    const isElementList = (obj) => {
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
            if (obj.length === 0) {
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
    };

    // Determine if it would make sense to add a property to an object.
    const isExtendableType = (obj) => {
        const objType = typeof obj;

        if (obj && (objType === 'object' || objType === 'function')) {
            return true;
        }

        return false;
    };

    // Deep copy all arguments into a new, single-level array.
    const flatten = (...queue) => {
        const result = [];

        while (queue.length > 0) {
            // Get and remove the first value from the queue.
            const item = queue.shift();

            if (isArrayish(item)) {
                let i = item.length;
                // If the array is non-empty, do a reverse loop.
                while (i--) {
                    // Add the array's children to the beginning of the queue
                    // to keep their order intact.
                    queue.unshift(item[i]);
                }
            }
            // The item has no depth we wish to traverse, it can be used as-is.
            else {
                result.push(item);
            }
        }

        return result;
    };

    // TODO: Make a function that will flatten objects as well

    const getTheGlobalObject = () => {
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
    };


    // args is everything flattened
    // firstArg = args[0]


    // namespace('foo') // returns window.foo or {}.foo
    // namespace(myObj, 'hello.foo') // returns myObj.hello.foo
    const namespace = (...args) => {
        const flattened = flatten(args);
        const [root] = flattened;
        // undefined is ok here, it can be filtered later
        const lastArg = flattened[flattened.length - 1];
        // The object to extend
        const base = isExtendableType(root) ? root : (getTheGlobalObject() || {});
        const force = typeof lastArg === 'boolean' ? lastArg : true;
        // Semantic fencepost for namespaces
        const separator = '.';
        // Match chains of at least one seperator
        const findSeparators = new RegExp('\\' + separator + '+', 'g');
        const filtered = flattened.filter((item) => {
            // True if argument should be used as a namespace. Note that its .toString() will be
            // called when setting it as a property.
            return typeof item === 'string' || typeof item === 'number';
        });
        const sanitized = filtered.join(separator).replace(findSeparators, separator);

        // The act of joining and then splitting an array will never result in an empty array,
        // even if the original was empty. So we need to check that we have not accidentally
        // inserted data for us to loop over.
        if (filtered.length > 0) {
            sanitized.split(separator).forEach((part) => {
                if (Object.prototype.hasOwnProperty.call(base, part) && isExtendableType(base[part])) {
                    base = base[part];
                }
                else if (force) {
                    base = base[part] = {};
                }
                else {
                    throw new TypeError(
                        'Unable to access \"' + part + '\" of \"' + sanitized + '\" without force mode. ' +
                        'Must be a truthy object or function and an own property.'
                    );
                }
            });
        }

        return base;
    };

    // Get the console back. Some sites wipe out the console methods to prevent developers from
    // putting them in production,
    // TODO: Figure out how to make this work in Node.js,
    //       where whatis(console) returns "console"
    const resetConsole = () => {
        // Step 1 - Handle cases where they create a new object with explicit
        // info, log, warn, (etc.) functions and assign that to window.console
        if (!isConsole(window.console)) {
            delete window.console;
        }

        // Step 2 - Handle cases where they assign empty functions in a loop
        // through console's properties, which come back to life like zombies
        // even after Step 1.
        // Both of these are necessary and in this order! Neither takes care of both.
        for (const property in window.console) {
            // do NOT do an if hasOwnProperty check here, we need
            // properties from up the prototype chain...
            if (isNative(window.console[property]) === false) {
                delete window.console[property];
            }
        }
        // At this point, the important functions should be automatically re-created.
    };

    const samePolarity = (first, ...rest) => {
        if (args.length < 2) {
            throw new Error('At least two values must be provided to compare.');
        }

        const neededPolarity = Boolean(first);

        return rest.every((elem) => {
            return Boolean(elem) === neededPolarity;
        });
    };

    // TODO: Create function stampArray()
    // TODO: Create function stamp() and make stampObject and stampArray abstract it

    // Return a new object with identical values for all property
    // names provided.
    const stampObject = (keys, values) => {
        // If the user does not provide any useful data...
        if (!keys) {
            // Just give back an empty object...
            return {};
        }

        keys = flatten(keys);
        values = flatten(values);

        // Used to avoid iterating past a sensible index
        const lastValueIndex = values.length - 1;
        return keys.reduce((obj, key, index) => {
            // Extract a value from the list between its first and last index,
            // but as close as possible to the current loop iteration...
            obj[key] = values[Math.max(0, Math.min(index, lastValueIndex))];
            return obj;
        }, {});
    };

    // Take an object for inspection and return whether all of its
    // properties match a given value.
    const checkStamp = (stamp, needle, strict) => {
        // No matter what, it has to be truthy.
        if (!stamp) {
            return;
        }
        if (isArrayish(stamp)) {
            // For arrays-like objects, we only consider their numerical indexes.
            return Array.prototype.slice.call(stamp).every((value) => {
                return strict ? value === needle : samePolarity(value, needle);
            });
        }
        if (isExtendableType(stamp)) {
            // For other objects that may have them, we consider all enumerable properties...
            return Object.values(stamp).every((value) => {
                return strict ? value === needle : samePolarity(value, needle);
            });
        }
    };

    // Make a string, with optional separators, from all arguments of a
    // certain polarity. Useful for paths, etc.
    const join = (option, ...values) => {
        // Allow passing a value in the first argument.
        if (!option || typeof option !== 'object') {
            values.unshift(option);
        }
        const { separator, polarity, surround } = Object.assign({}, option);
        const filtered = typeof polarity === 'undefined' ? values : values.filter((value) => {
            return polarity ? value : !value;
        });
        const joined = filtered.join(separator || '');
        return surround ? surround + joined + surround : joined;
    };

    // This function is designed to conveniently join all arguments that are truthy,
    // which is useful for constructing URLs and other data based on simple args,
    // without complicated logic.
    const joinTruthy = (option, ...rest) => {
        const config = (option && typeof option === 'object') ?
            Object.assign({}, option, {
                polarity : true
            }) :
            option;

        return join(config, ...rest);
    };

    // Join all arguments with a space, which is useful for
    // making sentences or shell commands.
    const space = (option, ...rest) => {
        const config = (option && typeof option === 'object') ?
            Object.assign({}, option, {
                separator : ' '
            }) :
            option;

        return join(config, ...rest);
    };

    // Join all truthy arguments with a space, which is useful for
    // making sentences or shell commands.
    const spaceTruthy = (option, ...rest) => {
        const config = (option && typeof option === 'object') ?
            Object.assign({}, option, {
                polarity  : true,
                separator : ' '
            }) :
            option;

        return join(config, ...rest);
    };

    // Join and then quote all arguments, which is useful for
    // making sentences or shell commands.
    const quote = (option, ...rest) => {
        const config = (option && typeof option === 'object') ?
            Object.assign({}, option, {
                surround : '"'
            }) :
            option;

        return join(config, ...rest);
    };

    // Koin and then quote all arguments, which is useful for
    // making sentences or shell commands.
    const quoteTruthy = (option, ...rest) => {
        const config = (option && typeof option === 'object') ?
            Object.assign({}, option, {
                polarity : true,
                surround : '"'
            }) :
            option;

        return join(config, ...rest);
    };

    // Help inexperienced users and remind people what they can do with the library.
    const help = () => {
        // TODO: Fix the case where this runs in Node.js and spews out garbage.
        console.log(
            '%cThe ' + appName + ' public API:',
            'background:blue;color:white;padding:4px 6px;border-radius:4px;line-height:' +
            '2em;font-weight:bold;font-family:Calibri;font-size:2vh;'
        );

        Object.keys(dangit).forEach((key) => {
            let type = whatis(dangit[key]);
            let symbol = '';
            if (type === 'function') {
                symbol = '()';
            }
            else if (type === 'object') {
                // Fix alignment.
                type = 'object  ';
            }
            else if (type === 'array') {
                symbol = '[]';
            }
            else if (type === 'string') {
                type = 'string  ';
            }
            console.log(`${type} : ${appName}.${key}${symbol}`);
        });
    };

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
});})(
    // Help Node out by setting up define.
    typeof module === 'object' && module.exports && typeof define !== 'function' ?
        (factory) => {
            module.exports = factory();
        } :
        define
);
