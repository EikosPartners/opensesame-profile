var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: path.join(__dirname, 'public'),
    entry: ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
            path.resolve(__dirname, 'public/src/app/app.js'),
            'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr'
    ],
    resolve: {
        root: [__dirname, path.join(__dirname, 'public/src/')],
        alias: {
            // scalejs

            'scalejs.application': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.application.js'),
            'scalejs.core': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.core.js'),
            'scalejs.sandbox': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.sandbox.js'),

            // extensions
            'scalejs.extensions': path.join(__dirname, 'public/src/extensions/scalejs.extensions.js'),
            'dataservice': 'extensions/dataservice.js',
            'userservice': 'extensions/userservice.js',
            'functionRegistry': 'extensions/functionRegistry.js',

            // requirejs-text, to be migrated to webpack and webpack html loader
            'text': 'npm_modules/requirejs-text/text', //still using this anywhere?
            'popup-styles.css': path.join(__dirname, 'node_modules/scalejs.popup/src/styles/popup-styles.css'),
            'sass': path.join(__dirname, 'public/sass')

        }
    },
    output: {
        path: path.resolve(__dirname, 'public', 'build'),
        publicPath: '/build/',
        filename: 'bundle.js'
    },
    resolveLoader: {
        alias: {
            'sass-global-vars-loader': path.join(__dirname, 'public/loaders/sass-global-vars-loader'),
            'px-to-em': path.join(__dirname, 'public/loaders/px-to-em'),
            'hot-loader': path.join(__dirname, 'public/loaders/hot-loader')
        }
    },
    module: {
        // testing custom sass code
        preLoaders: [
            {
                test: /\.scss/, loader: 'sass-global-vars-loader'
            },
            {
                test: /sprite.css/, loader: 'px-to-em'
            },
            {
                test: [
                    path.join(__dirname, 'node_modules/scalejs'),
                    path.join(__dirname, 'node_modules/datatables-epresponsive')
                ],
                loader: 'source-map-loader'
            },
            {
                test: [
                    /Module\.js$/
                ],
                loader: 'hot-loader'
            }
        ],
        loaders: [
            {
                loader: 'babel-loader',
                test: [
                    path.join(__dirname, 'public/src'),
                    path.join(__dirname, 'test/tests')
                ],
                exclude: /\.html?$/,
                query: {
                    presets: 'es2015',
                }
            },
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!autoprefixer-loader!sass-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader!autoprefixer-loader'
            },
            // {
            //     test: /\.svg$/,
            //     loader: 'svg-url-loader'
            // },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.woff|\.woff2|\.svg|.eot|\.png|\.jpg|\.ttf/,
                loader: 'url?prefix=font/&limit=10000'
            }
        ]
    },
    plugins: [
        // Avoid publishing files when compilation fails
        // new webpack.optimize.CommonsChunkPlugin( {
        //     name: "commons",
        //     filename: "commons.js",
        //     chunks: ["app"]
        // }),
        // new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()//,
        // new ExtractTextPlugin('main.css')
    ],
    // Create Sourcemaps for the bundle
    devtool: 'source-map'
};
