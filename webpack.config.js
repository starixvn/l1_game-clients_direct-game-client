const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin"); // For JS minification
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); // For CSS minification

// Determine if the environment is production or development
const isProduction = process.env.NODE_ENV === "production";

module.exports = {
    mode: isProduction ? "production" : "development", // Automatically switch mode
    entry: "./src/index.tsx",
    output: {
        filename: isProduction ? "[name].[contenthash].js" : "bundle.js", // Cache-busting for production
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, "dist"),
        },
        open: true,
        hot: true,
        port: 7457,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: "babel-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "images/",
                            publicPath: "/images/",
                        },
                    },
                ],
            },
        ],
    },
    optimization: isProduction
        ? {
              minimize: true,
              minimizer: [
                  new TerserPlugin({
                      // Minify JS files
                      terserOptions: {
                          compress: {
                              drop_console: true, // Remove console logs for production
                          },
                      },
                  }),
                  new CssMinimizerPlugin(), // Minify CSS files
              ],
              splitChunks: {
                  chunks: "all", // Code splitting for better caching
              },
              runtimeChunk: {
                  name: "runtime", // Separate runtime code
              },
          }
        : {},
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            minify: isProduction
                ? {
                      removeComments: true, // Remove comments from HTML
                      collapseWhitespace: true, // Remove whitespace
                      removeRedundantAttributes: true, // Remove redundant attributes
                  }
                : false,
        }),
    ],
};
