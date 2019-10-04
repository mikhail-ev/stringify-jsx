import esprima from 'esprima';

const JSX_ATTRIBUTE_REPLACEMENTS = {
    'className': 'class',
    'htmlFor': 'for'
};

const REPLACEMENT_TYPES = {
    expression: 'expression',
    attribute: 'attribute'
};

function replaceExpression(code, expressionStart, expressionEnd) {
    const codeBefore = code.slice(0, expressionStart);
    const codeAfter = code.slice(expressionEnd);
    // expression is passed with { }, so we cut them
    const expressionCode = code.slice(expressionStart + 1, expressionEnd - 1);
    return codeBefore + '\' + ' + expressionCode + ' + \'' + codeAfter;
}

function replaceAttribute(code, attributeStart, attributeEnd, attributeReplacementsMap, customReplacementFn) {
    const codeBefore = code.slice(0, attributeStart);
    const codeAfter = code.slice(attributeEnd);
    const attributeCode = code.slice(attributeStart, attributeEnd);
    const attributeParts = attributeCode.split('=');
    const attributeName = attributeParts[0];
    if (customReplacementFn) {
        attributeParts[0] = customReplacementFn(attributeName);
    } else {
        attributeParts[0] = attributeReplacementsMap[attributeName] || attributeName;
    }
    return codeBefore + attributeParts.join('=') + codeAfter;
}

function parse(code, {sourceType = 'module', attributeReplacementsMap = {}}) {
    const jsxElements = [];
    const jsxReplacements = [];
    esprima.parse(code, {sourceType, jsx: true},
        (node, meta) => {
            if (node.type === 'JSXElement') {
                jsxElements.push({
                    start: meta.start.offset,
                    end: meta.end.offset
                });
            } else if (node.type === 'JSXExpressionContainer') {
                jsxReplacements.push({
                    type: REPLACEMENT_TYPES.expression,
                    start: meta.start.offset,
                    end: meta.end.offset
                });
            } else if (node.type === 'JSXAttribute' && attributeReplacementsMap[node.name.name]) {
                jsxReplacements.push({
                    type: REPLACEMENT_TYPES.attribute,
                    start: meta.start.offset,
                    end: meta.end.offset
                });
            }
        }
    );
    return {
        jsxElements,
        jsxReplacements
    };
}

function getElementReplacements(replacements, elementStart, elementEnd) {
    return replacements
        .filter((replacement) =>
            replacement.start >= elementStart && replacement.end <= elementEnd)
        .sort((a, b) => b.end - a.end)
        .map((replacement) =>
            ({
                type: replacement.type,
                start: replacement.start - elementStart,
                end: (replacement.start - elementStart) + (replacement.end - replacement.start)
            }));
}

export default function stringifyJsx(code, {sourceType = 'module', customAttributeReplacements = {}, customReplacementFn} = {}) {
    const attributeReplacementsMap = Object.assign({}, JSX_ATTRIBUTE_REPLACEMENTS, customAttributeReplacements);
    const {jsxElements, jsxReplacements} = parse(code, {sourceType, attributeReplacementsMap});
    jsxElements
        .sort((a, b) => b.end - a.end)
        .forEach((element) => {
            const codeBefore = code.slice(0, element.start);
            const codeAfter = code.slice(element.end);
            let jsxCode = code.slice(element.start, element.end);
            getElementReplacements(jsxReplacements, element.start, element.end)
                .forEach((replacement) => {
                    switch (replacement.type) {
                        case REPLACEMENT_TYPES.expression: {
                            jsxCode = replaceExpression(jsxCode, replacement.start, replacement.end);
                            break;
                        }
                        case REPLACEMENT_TYPES.attribute: {
                            jsxCode = replaceAttribute(jsxCode, replacement.start, replacement.end,
                                attributeReplacementsMap, customReplacementFn);
                            break;
                        }
                    }
                });
            code = codeBefore + '\'' + jsxCode + '\'' + codeAfter;
        });

    return code;
}