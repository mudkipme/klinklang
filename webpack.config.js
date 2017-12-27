"use strict";

const path = require("path");
const webpack = require("webpack");

module.exports = {
  context: __dirname,
  devtool: "inline-source-map",
  entry: [
    "./public/main.jsx"
  ],
  output: {
    path: path.join(__dirname, "public", "build"),
    filename: "main.js",
    publicPath: "/"
  },
  resolve: {
    extensions: [".jsx", ".css", ".js", ".json"]
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: [
            ["@babel/preset-env", {
              "targets": {
                "browsers": ["chrome >= 63", "safari >= 11", "firefox >= 57", "edge >= 16"]
              },
              "modules": false
            }],
            "@babel/preset-react",
            "@babel/preset-stage-2"
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development")
    })
  ]
};