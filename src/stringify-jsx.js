import * as babel from '@babel/core';

export default function stringifyJsx(code, customOptions = {}, babelTransformOptions = {}) {
    const options = Object.assign({}, babelTransformOptions);

    options.plugins = options.plugins || [];
    options.plugins.push(['transform-stringify-jsx', customOptions]);

    options.parserOpts = options.parserOpts || {};
    options.parserOpts.plugins = options.parserOpts.plugins || [];
    options.parserOpts.plugins.push('jsx');

    return babel.default.transformSync(code, options);
}
