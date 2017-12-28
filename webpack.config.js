"use strict";

const path = require("path");
const fs = require("mz/fs");
const webpack = require("webpack");
const merge = require("webpack-merge");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: [
    "./public/main.jsx"
  ],
  output: {
    path: path.join(__dirname, "public", "build"),
    filename: "main.[chunkhash].js",
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
    new CleanWebpackPlugin([path.join(__dirname, "public", "build")]),
    function() {
      this.plugin("done", function(stats) {
        fs.writeFile(path.join(__dirname, "stats.generated.json"), JSON.stringify(stats.toJson().assetsByChunkName));
      });
    }
  ]
};

if (process.env.NODE_ENV === "production") {
  module.exports = merge(module.exports, {
    devtool: "source-map",
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production")
      }),
      new UglifyJSPlugin({
        sourceMap: true
      })
    ]
  });
} else {
  module.exports = merge(module.exports, {
    devtool: "inline-source-map",
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("development")
      })
    ]
  });
}