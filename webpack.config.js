'use strict';

const path = require('path');
const webpack = require('webpack');
const _ = require('lodash');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function(options) {
  const plugins = [
    new ExtractTextPlugin('styles.css', { allChunks: true }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(_.get(options, 'dev') ? 'development' : 'production')
    })
  ];
  if (!_.get(options, 'dev')) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }));
  }

  return {
    devtool: _.get(options, 'dev') ? 'cheap-module-eval-source-map' : 'hidden-source-map',
    entry: [
       './public/main.jsx'
    ],
    output: {
      path: path.join(__dirname, 'public'),
      filename: 'bundle.js',
      publicPath: '/'
    },
    resolve: {
      extensions: ['', '.jsx', '.scss', '.js', '.json'],
    },
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/,
          loader: 'babel',
          exclude: /node_modules/,
          query: {
            presets: ['es2015-webpack', 'react', 'stage-1']
          }
        },
        {
          test: /(\.scss|\.css)$/,
          loader: ExtractTextPlugin.extract('style', [
            'css?' + (_.get(options, 'dev') ? '' : 'minimize&') + 'sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
            'sass?sourceMap',
            'toolbox'
          ])
        },
      ]
    },
    toolbox: {
      theme: path.join(__dirname, 'public', 'toolbox-theme.scss')
    },
    plugins
  };
};