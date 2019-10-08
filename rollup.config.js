import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

const config = {
    external: [
        '@babel/types',
        '@babel/traverse',
        '@babel/generator',
        '@babel/parser'
    ],
    plugins: [
        json(),
        resolve()
    ]
};

export default [{
    input: 'src/stringify-jsx.js',
    output: {
        file: 'dist/stringify-jsx.es6.js',
        format: 'esm'
    },
    ...config
}, {
    input: 'src/stringify-jsx.js',
    output: {
        file: 'dist/stringify-jsx.js',
        format: 'cjs',
        interop: false
    },
    ...config
}];