var webpack = require('webpack');
var path = require('path');
var webpackConfig = require('./webpack.config');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

webpackConfig.entry = [
    path.resolve(__dirname, 'public/src/app/app.js')
];

webpackConfig.module.loaders =  webpackConfig.module.loaders.map(function (loader) {
    if (typeof loader.loader === 'string' && loader.loader.indexOf('style-loader!') === 0) {
        loader.loader = ExtractTextPlugin.extract('style-loader', loader.loader.replace('style-loader!', ''));
    }
    return loader;
});

webpackConfig.plugins.push(
    new ExtractTextPlugin('main.css')
);

webpackConfig.devtool = 'source-map';

module.exports = webpackConfig;
