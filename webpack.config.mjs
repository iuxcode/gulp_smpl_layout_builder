import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import config from "./config.mjs";

// eslint-disable-next-line no-undef
const ENV = process.env;

export default {
  mode: ENV.NODE_ENV ?? "development",
  entry: {
    "bundle": config.js.mainEntry,
    "bundle.min": config.js.mainEntry
  },
  output: {
    path: path.join(path.resolve(), config.js.outDir.replace("./", "")),
    filename: config.js.outputFile,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          compact: false
        }
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  target: "web",
  node: {
    __dirname: false,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      test: /\.min.js(\?.*)?$/i,
    })],
  },
};
