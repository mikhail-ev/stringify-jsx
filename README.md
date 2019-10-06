# stringify-jsx
JSX adaptation as a template system for non-React projects. Allowing to use JSX as a template everywhere adopting IDE's JSX highlight and formatting features.

## TLDR;
Transforming JSX:
```jsx harmony
class MyElement {
    render() {
        let title = "Hello World!";
        return <div>{title}</div>;
    }
}
```
Into this:
```js
class MyElement {
    render() {
        let title = "Hello World!";
        return "<div>" + title + "</div>";
    }
}
```

Also by default transforms JSX html attributes:
```jsx harmony
class MyElement {
    render() {
        let myClass = "action";
        return <label className={myClass} htmlFor="button"></label>;
    }
}
```
Into regular html:
```js
class MyElement {
    render() {
        let myClass = "action";
        return "<label class=" + myClass + "for=\"button\"></label>";
    }
}
```

## Options
```js
stringifyJsx('<div></div>', {
    // Preserve whitespaces between tags, default => false
    preserveWhitespace: false,
    // Custom attributes replacement functionality 
    customAttributeReplacements: {},
    customAttributeReplacementFn: void 0,
    // @babel/parser configuration
    parserOptions: { ... },
    // @babel/generator configuration
    generatorOptions: { ... }
})
```
Read more about [@babel/parser](https://babeljs.io/docs/en/babel-parser#options) and [@babel/generator](https://babeljs.io/docs/en/babel-generator#options) configuration.

## Custom attributes replacement
Pass ``customAttributeReplacements`` or ``customAttributeReplacementFn`` to options to adjust replacements. If ``customAttributeReplacementFn`` is passed ``customAttributeReplacements`` is ignored.

#### customAttributeReplacements
```js
stringifyJsx('<div value="hello world!"></div>', {
    customAttributeReplacements: {
        'value': 'data-value'
    }
})
// Result: "<div data-value=\"hello world!\">" + "</div>"
```

#### customAttributeReplacementFn
```js
stringifyJsx('<div value="hello world!"></div>', {
    customAttributeReplacementFn: (nodePath) => {
        return 'x-' + nodePath.node.name;
    }
})
// Result: "<div x-value=\"hello world!\">" + "</div>"
```
Read more about [babel transformating operations](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#transformation-operations).

## As a plugin
* [rollup-plugin-stringify-jsx](https://github.com/TargetTaiga/rollup-plugin-stringify-jsx)

## TODO
- [ ] Tests
- [ ] Webpack plugin
- [ ] Typings
