import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [{
    input: 'src/index.js',
    output: {
        file: 'dist/stringify-jsx.es6.js',
        format: 'esm'
    },
    plugins: [
        resolve(),
        commonjs()
    ]
}, {
    input: 'src/index.js',
    output: {
        file: 'dist/stringify-jsx.js',
        format: 'cjs'
    },
    plugins: [
        resolve(),
        commonjs()
    ]
}];