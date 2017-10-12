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
    if (['nodelist', 'htmlcollection'].includes(objType)) {
        return true;
    }
    if (isArrayish(obj)) {
        return (obj.length > 0) && Array.from(obj).every((value) => {
            return isElement(value);
        });
    }
    const values = Object.values(obj);
    return typeof obj === 'object' && values.length > 0 && values.every((value) => {
        return isElement(value);
    });
};

// Determine if it would make sense to add a property to an object.
const isExtendableType = (obj) => {
    return Boolean(obj) && ['object', 'function'].includes(typeof obj);
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
    if (typeof window === 'object' && isTheGlobalObject(window)) {
        return window;
    }
    if (typeof global === 'object' && isTheGlobalObject(global)) {
        return global;
    }
};

// Given a base object and/or a dot path, return the object referred to by the final segment.
const namespace = (...args) => {
    const flattened = flatten(args);
    const lastArg = flattened[flattened.length - 1];
    // The object to extend
    const base = isExtendableType(flattened[0]) ? flattened[0] : (getTheGlobalObject() || {});
    const force = typeof lastArg === 'boolean' ? lastArg : true;
    // Semantic fencepost for namespaces
    const separator = '.';
    // Match chains of at least one seperator
    const findSeparators = new RegExp('\\' + separator + '+', 'g');
    const filtered = flattened.filter((item) => {
        // True if argument should be used as a namespace. Note that its .toString() will be
        // called when setting it as a property.
        return ['string', 'number'].includes(typeof item);
    });
    const dotPath = filtered.join(separator).replace(findSeparators, separator);

    // The act of joining and then splitting an array will never result in an empty array,
    // even if the original was empty. So we need to check that we have not accidentally
    // inserted data for us to loop over.
    return (filtered.length < 1) ? base : dotPath.split(separator).reduce((result, part) => {
        if (Object.prototype.hasOwnProperty.call(result, part) && isExtendableType(result[part])) {
            return result[part];
        }
        if (force) {
            result[part] = {};
            return result[part];
        }
        throw new TypeError(
            `Unable to access "${part}" of "${dotPath}" without force mode. ` +
            'Must be an object or function and an own property.'
        );
    }, base);
};

// Get the console back. Some sites wipe out the console methods to prevent developers from
// putting them in production,
// TODO: Figure out how to make this work in Node.js,
//       where whatis(console) returns "console"
const resetConsole = () => {
    // Handle cases where they create a mock object and assign it to window.console
    if (!isConsole(window.console)) {
        delete window.console;
    }

    // Handle cases where they assign empty functions to console's properties,
    // which come back to life like zombies even after deleting the console.
    // Both of these are necessary and in this order! Neither handles both.
    // Also, we need properties from up the prototype chain.
    for (const property in window.console) {
        if (isNative(window.console[property]) === false) {
            delete window.console[property];
        }
    }
    // At this point, the important functions should be automatically re-created.
};

const samePolarity = (first, ...rest) => {
    if (rest.length < 1) {
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
const stampObject = (_keys, _values) => {
    // If the user does not provide any useful data...
    if (!_keys) {
        // Just give back an empty object...
        return {};
    }

    const keys = flatten(_keys);
    const values = flatten(_values);

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

const dangit = {
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
    quoteTruthy
};

// Help inexperienced users and remind people what they can do with the library.
dangit.help = () => {
    // TODO: Fix the case where this runs in Node.js and spews out garbage.
    console.log(
        '%cThe dangit public API:',
        'background:blue;color:white;padding:4px 6px;border-radius:4px;line-height:' +
        '2em;font-weight:bold;font-family:Calibri;font-size:2vh;'
    );

    Object.entries(dangit).forEach(([key, val]) => {
        if (key === 'help') {
            return;
        }
        let type = whatis(val);
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
        console.log(`${type} : dangit.${key}${symbol}`);
    });
};

export default dangit;
