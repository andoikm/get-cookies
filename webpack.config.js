const path = require('path');

module.exports = {
  entry: {
    popup: './src/scripts/app.ts',
    background: './src/background/background.ts',
    content: './src/content/content.ts',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: __dirname,
    },
    port: 3000,
    open: true,
    hot: true,
  },
}; 