const fs = require('fs');
const path = require('path');
const stringifyJsx = require('../..');

it('should transform basic JSX', () => {
    const { code } = stringifyJsx(fs.readFileSync(path.join(__dirname, 'input.js')).toString());
    expect(code).toMatchSnapshot();
});