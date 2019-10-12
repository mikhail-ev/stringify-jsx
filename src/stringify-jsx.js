import parser from '@babel/parser';
import traverse from '@babel/traverse';
import types from '@babel/types';
import generator from '@babel/generator';
import TemplatePartial from './template-partial';

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

function transformJSXElement(jsxElementPath, options) {
    return transformJSXOpeningElement(jsxElementPath.get('openingElement'), options)
        .concat(transformJSXChildren(jsxElementPath.get('children'), options))
        .concat(transformJSXClosingElement(jsxElementPath.get('closingElement'), options));
}

function transformJSXOpeningElement(jsxOpeningElementPath, options) {
    const partial = new TemplatePartial();
    partial.addQuasi('<' + jsxOpeningElementPath.node.name.name);
    jsxOpeningElementPath.get('attributes').forEach((attributePath) => {
        const name = getAttributeName(attributePath.get('name'), options);
        const valuePath = attributePath.get('value');
        if (valuePath.isJSXExpressionContainer()) {
            partial.addQuasi(' ' + name + '="');
            partial.addExpression(
                types.identifier(valuePath.get('expression').toString()));
            partial.addQuasi('"');
        } else {
            partial.addQuasi(' ' + name + '=' + valuePath.toString());
        }
    });
    let closing = jsxOpeningElementPath.node.selfClosing ? '/>' : '>';
    partial.addQuasi(closing);
    return partial;
}

function transformJSXClosingElement(jsxClosingElementPath, options) {
    const partial = new TemplatePartial();
    if (jsxClosingElementPath.node) {
        partial.addQuasi(jsxClosingElementPath.toString());
    }
    return partial;
}

function trimText(text, options) {
    if (options.preserveWhitespace) {
        return text;
    } else {
        // If text consists not only of whitespace we do not touch it to preserve formatting
        if (text.trim()) {
            return text;
        }
    }
    return '';
}

function transformJSXChildren(jsxChildPaths, options) {
    const partial = new TemplatePartial();
    jsxChildPaths.forEach((childPath) => {
        if (childPath.isJSXElement()) {
            partial.concat(transformJSXElement(childPath, options));
        }
        if (childPath.isJSXText()) {
            partial.addQuasi(trimText(childPath.node.value, options));
        }
        if (childPath.isJSXExpressionContainer()) {
            partial.addExpression(types.identifier(childPath.get('expression').toString()));
        }
    });
    return partial;
}

function getAttributeName(jsxIdentifierPath, options) {
    const name = jsxIdentifierPath.node.name;
    const defaultReplacement = JSX_ATTRIBUTE_REPLACEMENTS[name];
    if (options.customAttributeReplacementFn) {
        return options.customAttributeReplacementFn(jsxIdentifierPath, defaultReplacement);
    }
    return options.customAttributeReplacements[name] || defaultReplacement || name;
}

function transformCallToTaggedExpression(callExpressionPath, templateLiteral) {
    const identifier = types.identifier(callExpressionPath.get('callee').toString());
    return types.taggedTemplateExpression(identifier, templateLiteral);
}

export default function stringifyJsx(code, customOptions = {}) {
    const options = mergeOptions(customOptions);
    const ast = parser.parse(code, options.parserOptions);
    traverse.default(ast, {
        JSXElement(path) {
            const templateLiteral = transformJSXElement(path, options).toTemplate();
            const parentPath = path.parentPath;
            if (parentPath.isCallExpression()) {
                parentPath.replaceWith(transformCallToTaggedExpression(parentPath, templateLiteral));
            } else {
                path.replaceWith(templateLiteral);
            }
        }
    });
    return generator.default(ast, options.generatorOptions, code);
}
