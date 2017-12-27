const CleanWebpackPlugin = require("clean-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const path = require("path");

module.exports = {
  target: "node",
  devtool: "source-map",
  externals: [nodeExternals()],
  entry: {
    klinklang: path.resolve(__dirname, "klinklang.js"),
    radar: path.resolve(__dirname, "radar.js")
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/build/",
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "commonjs2"
  },
  node: {
    __dirname: true
  },
  resolve: {
    extensions: [".jsx", ".js"]
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
                "node": "current"
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
    new CleanWebpackPlugin([path.join(__dirname, "build")])
  ]
};