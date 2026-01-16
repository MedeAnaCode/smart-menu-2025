const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const isDev = process.env.NODE_ENV !== "production";

module.exports = {
    mode: isDev ? "development" : "production",
    entry: './src/index.tsx', // Путь к главному файлу React компонента
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: isDev ? "bundle.js" : "bundle.[contenthash].js",
        publicPath: "/"
    },
    devtool: isDev ? "eval-cheap-module-source-map" : "source-map",
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ["@babel/preset-env", { targets: "defaults" }],
                            ["@babel/preset-react", { runtime: "automatic" }]
                        ],
                        plugins: isDev ? ["react-refresh/babel"] : []
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    {
                        loader: "css-loader",
                        options: {
                            url: false //чтобы css не интерпретировал url изображений как модули
                        },
                    },
                    // Compiles Sass to CSS
                    "sass-loader",
                ]
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html', // Путь к вашему HTML шаблону
            minify: !isDev
        }),
        ...(isDev ? [new ReactRefreshWebpackPlugin()] : [])
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    devServer: {
        static: [
            {
                directory: path.join(__dirname, 'public'),
                publicPath: '/',
            }
        ],
        compress: true,
        port: 9000,
        hot: true, //ключ для HMR
        historyApiFallback: true, //для ReactRouter
        client: {
            overlay: true
        },
        proxy: [
            {
                context: ["/api"],
                target: "http://backend:3001",
                changeOrigin: true
            }
        ]
    }
};
