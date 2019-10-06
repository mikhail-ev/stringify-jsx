'use strict';

var parser = require('@babel/parser');
var traverse = require('@babel/traverse');
var types = require('@babel/types');
var generator = require('@babel/generator');

const JSX_ATTRIBUTE_REPLACEMENTS = {
    'className': 'class',
    'htmlFor': 'for'
};

const DEFAULT_OPTIONS = {
    preserveWhitespace: false,
    customAttributeReplacements: {},
    customAttributeReplacementFn: void 0
};

const DEFAULT_PARSER_OPTIONS = {
    sourceType: 'module',
    plugins: ["jsx"]
};

const DEFAULT_GENERATOR_OPTIONS = {
    sourceMaps: false
};

function mergeOptions(options) {
    return Object.assign({}, {
        parserOptions: Object.assign({}, DEFAULT_PARSER_OPTIONS, options.parserOptions),
        generatorOptions: Object.assign({}, DEFAULT_GENERATOR_OPTIONS, options.generatorOptions),
        ...DEFAULT_OPTIONS
    }, options);
}

function arrayToBinaryExpression(array, operator = '+') {
    return array.reduce((prev, curr) => {
        return types.binaryExpression(operator, prev, curr);
    });
}

function transformText(jsxTextPath, preserveWhitespace) {
    if (!preserveWhitespace) {
        return jsxTextPath.node.value && jsxTextPath.node.value.trim();
    }
    return jsxTextPath.node.value;
}

function transformChildren(jsxChildPaths, options) {
    const result = [];
    jsxChildPaths.forEach((childPath) => {
        if (childPath.isJSXElement()) {
            result.push(types.cloneNode(childPath.node));
        }
        if (childPath.isJSXText()) {
            const text = transformText(childPath, options.preserveWhitespace);
            if (text) {
                result.push(types.stringLiteral(childPath.node.value && childPath.node.value.trim()));
            }
        }
        if (childPath.isJSXExpressionContainer()) {
            result.push(types.identifier(childPath.toString()));
        }
    });
    return result;
}

function transformOpeningElement(jsxOpeningElementPath, options) {
    const literals = [];
    let parts = [];
    parts.push('<' + jsxOpeningElementPath.node.name.name);
    jsxOpeningElementPath.get('attributes').forEach((attributePath) => {
        const name = getAttributeName(attributePath.get('name'), options);
        const valuePath = attributePath.get('value');
        if (valuePath.isJSXExpressionContainer()) {
            literals.push(types.stringLiteral(parts.join(' ')));
            parts = [];
            literals.push(types.stringLiteral(' ' + name + '="')); // TODO expression value should be in ""
            literals.push(types.identifier(valuePath.get('expression').toString()));
            parts.push('"');
        } else {
            parts.push(name + '=' + valuePath.toString());
        }
    });
    let closing = jsxOpeningElementPath.node.selfClosing ? '/>' : '>';
    literals.push(types.stringLiteral(parts.join(' ').concat(closing)));
    return arrayToBinaryExpression(literals);
}

function getReplacement(jsxOpeningElementPath, jsxChildPaths, jsxClosingElementPath, options) {
    const expressions = [transformOpeningElement(jsxOpeningElementPath, options)];
    const transformedChildren = transformChildren(jsxChildPaths, options.preserveWhitespace);
    if (transformedChildren.length === 1) {
        expressions.push(transformedChildren[0]);
    } else if (transformedChildren.length > 1) {
        expressions.push(arrayToBinaryExpression(transformedChildren));
    }
    if (jsxClosingElementPath.node) {
        expressions.push(types.stringLiteral(jsxClosingElementPath.toString()));
    }
    return arrayToBinaryExpression(expressions);
}

function getAttributeName(jsxIdentifierPath, options) {
    if (options.customAttributeReplacementFn) {
        return options.customAttributeReplacementFn(jsxIdentifierPath);
    }
    const name = jsxIdentifierPath.node.name;
    return options.customAttributeReplacements[name] || JSX_ATTRIBUTE_REPLACEMENTS[name] || name;
}

function stringifyJsx(code, customOptions = {}) {
    const options = mergeOptions(customOptions);
    const ast = parser.parse(code, options.parserOptions);
    traverse.default(ast, {
        JSXElement(path) {
            path.replaceWith(getReplacement(
                path.get('openingElement'),
                path.get('children'),
                path.get('closingElement'),
                options
            ));
        }
    });
    return generator.default(ast, options.generatorOptions, code);
}

module.exports = stringifyJsx;
