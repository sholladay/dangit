// Get the real type of an object to workaround reliability issues with typeof and instanceof.
const whatis = (obj, lowerCase) => {
    // Using the safest toString possible, get the object type from the '[object Foo]' string.
    const type = Object.prototype.toString.call(obj).match(/ (.+?)\]/u)[1];
    return (lowerCase || typeof lowerCase === 'undefined') ? type.toLowerCase() : type;
};

// Get a human friendly version of an object's class.
const describe = (obj) => {
    return whatis(obj, false).replace(/(?=[A-Z][a-z])/gu, ' ').trimLeft();
};

// Check if a function (e.g. console.log) has been modified. Sadly, this only works on functions.
const isNative = (context) => {
    if (typeof context !== 'function') {
        return;
    }
    // Using the safest toString possible, look for 'native code' in a way that's hard to fool.
    // The regex takes into account browser quirks that output the string differently.
    return /^function .*?\(.*?\)\s*?\{\s*?\[native code\]/u.test(
        Function.prototype.toString.call(context)
    );
};

const isTheGlobalObject = (obj) => {
    // Chrome, Opera, Node.js say 'global' ... IE, FF, Safari, others say 'window'
    return ['global', 'window'].includes(whatis(obj));
};

const checkType = (type) => {
    return (obj) => {
        return whatis(obj) === type;
    };
};

const isSpeechSynthesisUtterace = checkType('speechsynthesisutterance');
const isPlainObject = checkType('object');
const isNull = checkType('null');
const isRegExp = checkType('regexp');
const isNumber = checkType('number');
const isDate = checkType('date');
const isMath = checkType('math');
const isArray = checkType('array');
const isArrayish = (obj) => {
    return Boolean(obj) && typeof obj === 'object' && typeof obj.length === 'number';
};
const isFunction = (obj) => {
    return typeof obj === 'function';
};
const isConsole = (obj) => {
    // Unfortunately, Chrome returns 'object' instead of 'console'
    return whatis(obj) === 'console' || obj === console;
};
const isElement = (obj) => {
    return /html\w+element/u.test(whatis(obj));
};
const isElementList = (obj) => {
    const objType = whatis(obj);

    if (!obj) {
        return false;
    }
    if (['nodelist', 'htmlcollection'].includes(objType)) {
        return true;
    }
    if (isArrayish(obj)) {
        return (obj.length > 0) && Array.from(obj).every(isElement);
    }
    const values = Object.values(obj);
    return typeof obj === 'object' && values.length > 0 && values.every(isElement);
};

// Determine if it would make sense to add a property to an object.
const isExtendableType = (obj) => {
    return Boolean(obj) && ['object', 'function'].includes(typeof obj);
};

// Determine if an object has depth, as in whether or not it contains something.
const isDeep = (obj) => {
    return isArrayish(obj) ?
        obj.length > 0 :
        Boolean(obj) && typeof obj === 'object' && Object.keys(obj).length > 0;
};

// Deep copy all arguments into a new, single-level array.
const flatten = (...queue) => {
    const result = [];

    while (queue.length > 0) {
        // Get and remove the first value from the queue.
        const item = queue.shift();
        if (isArrayish(item)) {
            // Add the array's children to the start of the queue to keep their order intact.
            for (let i = item.length - 1; i >= 0; i -= 1) {
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
    const base = isExtendableType(flattened[0]) ? flattened[0] : (getTheGlobalObject() || {});
    const force = typeof lastArg === 'boolean' ? lastArg : true;
    const separator = '.';
    // Match chains of at least one seperator
    const findSeparators = new RegExp('\\' + separator + '+', 'gu');
    const filtered = flattened.filter((item) => {
        // True if argument should be used as a namespace. Note that its .toString() will be
        // called when setting it as a property.
        return ['string', 'number'].includes(typeof item);
    });
    const dotPath = filtered.join(separator).replace(findSeparators, separator);

    // Check the filtered length because dotPath.split() will never return an empty list.
    return (filtered.length === 0) ? base : dotPath.split(separator).reduce((result, part) => {
        if (Object.prototype.hasOwnProperty.call(result, part) && isExtendableType(result[part])) {
            return result[part];
        }
        if (force) {
            result[part] = {};
            return result[part];
        }
        throw new TypeError(
            `Use force mode to write to this property: "${part}" of "${dotPath}"`
        );
    }, base);
};

// Fix the console. Some sites break the console to prevent engineers from logging in production.
const resetConsole = () => {
    // Handle cases where they create a mock object and assign it to window.console
    if (!isConsole(console)) {
        delete getTheGlobalObject().console;
    }

    // Handle cases where they assign functions to console properties, which come back to life
    // like zombies even after deleting the console. Both are necessary and in this order!
    // Also, we need properties from up the prototype chain.
    for (const property in console) {
        if (isNative(console[property]) === false) {
            delete console[property];
        }
    }
};

const samePolarity = (first, ...rest) => {
    if (rest.length === 0) {
        throw new Error('At least two values must be provided to compare.');
    }
    const neededPolarity = Boolean(first);
    return rest.every((elem) => {
        return Boolean(elem) === neededPolarity;
    });
};

// Return a new object with identical values for all property names provided.
const stampObject = (_keys, _values) => {
    const keys = flatten(_keys);
    const values = flatten(_values);

    const lastValueIndex = values.length - 1;
    return keys.reduce((obj, key, index) => {
        // Extract a value from the list between its first and last index,
        // but as close as possible to the current loop iteration...
        obj[key] = values[Math.max(0, Math.min(index, lastValueIndex))];
        return obj;
    }, {});
};

// Check if all of an object's properties match a given value or polarity.
const checkStamp = (stamp, needle, strict) => {
    const check = (value) => {
        return strict ? value === needle : samePolarity(value, needle);
    };
    if (isArrayish(stamp)) {
        return Array.from(stamp).every(check);
    }
    if (isExtendableType(stamp)) {
        return Object.values(stamp).every(check);
    }
};

// Make common string patterns.
const join = (option, ...values) => {
    // Allow passing a value in the first argument.
    if (!option || typeof option !== 'object') {
        values.unshift(option);
    }
    const { separator, polarity, surround } = { ...option };
    const filtered = typeof polarity === 'undefined' ? values : values.filter((value) => {
        return polarity ? value : !value;
    });
    const joined = filtered.join(separator || '');
    return surround ? surround + joined + surround : joined;
};

const makeJoiner = (overrideOption) => {
    return (option, ...rest) => {
        const config = (option && typeof option === 'object') ?
            {
                ...option,
                ...overrideOption
            } :
            option;

        return join(config, ...rest);
    };
};

// Join all arguments that are truthy. Useful for making URLs from template data.
const joinTruthy = makeJoiner({ polarity : true });
// Join and separate arguments with a space. Useful for making sentences or shell commands.
const space = makeJoiner({ separator : ' ' });
const spaceTruthy = makeJoiner({
    polarity  : true,
    separator : ' '
});
// Join and quote arguments. Useful for making sentences or shell commands.
const quote = makeJoiner({ surround : '"' });
const quoteTruthy = makeJoiner({
    polarity : true,
    surround : '"'
});

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

// TODO: Fix output in Node.js, where it spews out garbage.
dangit.help = () => {
    console.log(
        '%cThe dangit public API:',
        'background:blue;color:white;padding:4px 6px;border-radius:4px;line-height:' +
        '2em;font-weight:bold;font-family:Calibri;font-size:2vh;'
    );
    Object.entries(dangit).forEach(([key, val]) => {
        if (key !== 'help') {
            const type = whatis(val);
            let symbol = type === 'function' ? '()' : '';
            if (type === 'array') {
                symbol = '[]';
            }
            console.log(`${type.padEnd(8, ' ')} : dangit.${key}${symbol}`);
        }
    });
};

export default dangit;
