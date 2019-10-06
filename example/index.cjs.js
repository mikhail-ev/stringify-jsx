const fs = require('fs');
const stringifyJsx = require("stringify-jsx");

fs.writeFileSync('dist/my-component.js', stringifyJsx(fs.readFileSync('src/my-component.js').toString()).code);