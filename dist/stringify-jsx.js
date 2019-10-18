'use strict';

var babel = require('@babel/core');

function stringifyJsx(code, customOptions = {}, babelTransformOptions = {}) {
    const options = Object.assign({}, babelTransformOptions);

    options.plugins = options.plugins || [];
    options.plugins.push(['transform-stringify-jsx', customOptions]);

    options.parserOpts = options.parserOpts || {};
    options.parserOpts.plugins = options.parserOpts.plugins || [];
    options.parserOpts.plugins.push('jsx');

    return babel.transformSync(code, options);
}

module.exports = stringifyJsx;
