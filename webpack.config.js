const path = require('path');

var babelOptions = {
    "presets": ["es2017"]

  };

module.exports = {
    entry: {
        index: './index.ts'
    },
    module: {
        rules: [{
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: [
            // {
            //   loader: 'babel-loader',
            //   options: babelOptions
            // },
            {
              loader: 'ts-loader'
            }
          ]
        }]
      },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: "development"
};