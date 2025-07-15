const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js', // Путь к главному файлу React компонента
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
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
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html' // Путь к вашему HTML шаблону
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        static: [
            {
                directory: path.join(__dirname, 'public'),
                publicPath: '/',
            },
            {
                directory: path.join(__dirname, 'dist'),
            }
        ],
        compress: true,
        port: 9000,
        proxy: {
            '/api': 'http://localhost:3001'
        }
    }
};
