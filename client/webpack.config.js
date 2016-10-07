const webpack = require('webpack');
const path = require('path');

const debug = process.env.NODE_ENV !== 'production';
const hot = process.env.REACT_HOT;
const plugins = [];

const envVars = {
  apiUrl: '//localhost:8080/api',
};

plugins.push(
  new webpack.DefinePlugin({
    __ENV__: JSON.stringify(envVars),
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }));

plugins.push(
  new webpack.NormalModuleReplacementPlugin(
    /Autosuggest\.scss$/,
    'react-bootstrap-autosuggest/src/Autosuggest.scss')
);

if (hot) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
  entry: {
    main: hot ? [
      'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
      'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
      './main.js', // Your appʼs entry point
    ] : [
      './main.js',
    ],
  },
  output: {
    path: 'builds',
    publicPath: '/builds/',
    filename: '[name].bundle.js',
    chunkFilename: '[name]-[chunkhash].js',
  },
  resolve: {
    modulesDirectories: [
      'node_modules',
      'media',
    ],
  },
  plugins,
  debug,
  devtool: debug ? 'cheap-eval-source-map' : false,
  devServer: {
    historyApiFallback: true,
    stats: 'errors-only',
  },
  module: {
    preLoaders: debug ? [
      {
        // Lint
        test: /\.jsx?$/,
        include: __dirname,
        exclude: [],
        loader: 'eslint',
      },
    ] : [],
    loaders: [
      {
        // Compile JS with Babel.
        test: /\.jsx?$/,
        include: __dirname,
        loader: 'babel',
        query: {
          plugins: [
            'transform-runtime',
            'transform-object-rest-spread',
            'react-hot-loader/babel',
          ],
          presets: [
            'es2015',
            'react',
          ],
        },
      },
      {
        // SASS
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass'],
      },
      {
        // LESS
        test: /\.less$/,
        loaders: ['style', 'css', 'less-loader'],
      },
      {
        // CSS
        test: /\.css$/,
        loaders: ['style', 'css'],
      },
      {
        // Fonts
        test: /\.(eot|woff|woff2|ttf)/,
        loader: 'file-loader?name=fonts/[name]-[hash].[ext]',
      },
      {
        // SVG Fonts
        test: /redux-toastr\.svg$/,
        loader: 'file-loader?name=fonts/[name]-[hash].[ext]',
      },
      {
        // Inline SVG icons
        include: path.join(__dirname, 'media/icons'),
        test: /\.svg$/i,
        loader: 'react-svg-inline-loader',
      },
    ],
  },
};
