const webpack = require('webpack');
const path = require('path');

const debug = process.env.NODE_ENV !== 'production';
const envVars = {
  apiUrl: '//localhost:8080/api',
};
const plugins = [
  new webpack.DefinePlugin({
    __ENV__: JSON.stringify(envVars),
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),
  new webpack.LoaderOptionsPlugin({ minimize: !debug, debug }),
];

// Minimal babel transforms for modern browsers.
var babel_plugins = [
  'transform-runtime',
  'transform-object-rest-spread',
  // Transforms needed for modern browsers only
  'babel-plugin-check-es2015-constants',
  'babel-plugin-transform-es2015-block-scoping',
  'babel-plugin-transform-es2015-function-name',
  'babel-plugin-transform-es2015-parameters',
  'babel-plugin-transform-es2015-destructuring',
  'react-hot-loader/babel',
];

module.exports = {
  context: path.resolve(__dirname, 'client'),
  entry: {
    main: [ './main.js' ],
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
  // devtool: debug ? 'cheap-eval-source-map' : 'hidden-source-map',
  devtool: debug ? 'inline-source-map' : 'hidden-source-map',
  module: {
    rules: [
      {
        // Compile JS with Babel.
        test: /\.jsx?$/,
        include: path.resolve(__dirname, 'client'),
        loaders: [
          {
            loader: 'babel',
            query: {
              plugins: babel_plugins,
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
          {
            loader: 'eslint',
          }
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
      {
        test: /\.(graphql|gql)$/,
        include: path.resolve(__dirname, 'client'),
        loader: 'graphql-tag/loader'
      }
    ],
  },
};
