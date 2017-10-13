// eslint-disable-next-line import/extensions
import pkg from './package.json';

export default {
    input  : 'index.js',
    output : [
        {
            file   : pkg.main,
            format : 'cjs'
        },
        {
            file   : pkg.module,
            format : 'es'
        },
        {
            file   : pkg.browser,
            format : 'umd',
            name   : 'dangit'
        }
    ]
};
