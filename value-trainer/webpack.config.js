const path = require('path');

module.exports = {
    mode: 'development',
    devServer: {
	contentBase: './dist'
    },
    entry: './src/index.js',
    output: {
	filename: 'main.js',
	path: path.resolve(__dirname, 'dist/'),
	library: 'exercises',
	libraryTarget: 'window'
	}
};
