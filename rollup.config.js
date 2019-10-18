const config = {
    external: [
        '@babel/core'
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