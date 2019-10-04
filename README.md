# stringify-jsx
JSX adaptation as a template system for non-React projects. Allowing to use JSX as a template everywhere adopting IDE's JSX highlight and formatting features.
## Examples and documentation
TLRD;

Transforming JSX:
```jsx harmony
class MyElement {
    render() {
        let title = 'Hello World!';
        return <div>{title}</div>;
    }
}
```
Into this:
```js
class MyElement {
    render() {
        let title = 'Hello World!';
        return '<div>' + title + '</div>';
    }
}
```

Also by default transforms JSX html attributes:
```jsx harmony
class MyElement {
    render() {
        let myClass = 'action';
        return <label className={myClass} htmlFor="button"></label>;
    }
}
```
Into regular html:
```js
class MyElement {
    render() {
        let myClass = 'action';
        return '<label class=' + myClass + ' for="button"></label>';
    }
}
```

## Options
TBD

## As a plugin
* [rollup-plugin-stringify-jsx](https://github.com/TargetTaiga/rollup-plugin-stringify-jsx)

## TODO
- [ ] Typings
- [ ] Tests