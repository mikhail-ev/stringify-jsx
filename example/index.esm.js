import fs from 'fs';
import stringifyJsx from "stringify-jsx/dist/stringify-jsx.es6.js";

fs.writeFileSync('dist/my-component.js', stringifyJsx(fs.readFileSync('src/my-component.js').toString()).code);