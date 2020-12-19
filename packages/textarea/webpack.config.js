const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3001
  },
  output: {
    publicPath: "http://localhost:3001",
    libraryTarget: 'umd',
    filename: 'datalayer-rtc.js',
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      'ws': path.resolve(path.join(__dirname, 'node_modules/ws/index.js' )) // fix for https://github.com/websockets/ws/issues/1538
    }
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)?$/,
        loader: "babel-loader",
//        options: {
//          presets: [
//            "@babel/preset-env", 
//            "@babel/preset-react", 
//            "@babel/preset-typescript"
//          ]
//       }
      },
      {
        test: /\.js(x?)?$/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    }),
  ]
};
