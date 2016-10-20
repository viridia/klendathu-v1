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

plugins.push(new webpack.LoaderOptionsPlugin({
  minimize: !debug,
  debug,
}));

if (hot) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
  context: path.resolve(__dirname, 'client'),
  entry: {
    main: hot ? [
      'webpack-dev-server/client?http://0.0.0.0:8081', // WebpackDevServer host and port
      'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
      './main.js', // Your appʼs entry point
    ] : [
      './main.js',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'builds'),
    publicPath: '/builds/',
    filename: '[name].bundle.js',
    chunkFilename: '[name]-[chunkhash].js',
  },
  resolve: {
    modules: [
      'node_modules',
      'media',
    ],
    extensions: ['.js', '.jsx'],
  },
  plugins,
  devtool: debug ? 'cheap-eval-source-map' : 'hidden-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, 'client'),
    historyApiFallback: true,
    stats: 'errors-only',
  },
  module: {
    loaders: [
      {
        // Compile JS with Babel.
        test: /\.jsx?$/,
        include: path.resolve(__dirname, 'client'),
        loaders: [
          {
            loader: 'babel',
            query: {
              plugins: [
                'transform-runtime',
                'transform-object-rest-spread',
                'react-hot-loader/babel',
              ],
              presets: [
                ['es2015', { modules: false }],
                'react',
              ],
            },
          },
          'eslint',
        ],
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
        include: path.join(__dirname, 'client/media/icons'),
        test: /\.svg$/i,
        loader: 'react-svg-inline-loader',
      },
    ],
  },
};
