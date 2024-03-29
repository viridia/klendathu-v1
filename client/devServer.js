const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('../webpack.config.js');

// Adjust the config for hot reloading.
config.entry = [
  'react-hot-loader/patch',
  'webpack-dev-server/client?http://127.0.0.1:8081', // WebpackDevServer host and port
  'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
  './main.js', // Your appʼs entry point
];
config.plugins.push(new webpack.HotModuleReplacementPlugin());
// "react-hot-loader/babel"

const compiler = webpack(config);
const server = new WebpackDevServer(compiler, {
  contentBase: __dirname,
  historyApiFallback: true,
  stats: 'errors-only',
  hot: true,
  publicPath: '/builds/',
});
server.listen(8081, 'localhost', () => {});

console.log('Dev server starting.');
