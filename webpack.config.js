var path = require('path'),
  _ = require('lodash'),
  webpack = require('webpack'),
  ExtractTextPlugin = require('extract-text-webpack-plugin')

const vendor = [
  'lodash'
]

function createConfig(isDebug) {
  const devtool = isDebug ? 'cheap-module-source-map' : false 
  const plugins = [
    new webpack.optimize.CommonsChunkPlugin({ 
      name: 'vendor', 
      filename: 'vendor.js'
    }),
    new webpack.DefinePlugin({
      process_env: {
        NODE_ENV: `"${process.env.NODE_ENV || "development"}"}` 
      },
      IS_PRODUCTION: !isDebug,
      IS_DEVELOPMENT: isDebug,
    })
  ]

  const loaders = {
    js: { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
    eslint: { test: /\.jsx?$/, loader: 'eslint-loader', exclude: /node_modules/ },
    css: { test: /\.css?$/, use: ['style-loader', 'css-loader?sourceMap'] },
    sass: { test: /\.scss?$/, use: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap'] },
    files: { test: /\.(png|jpg|jpeg|gif|woff|ttf|eot|svg|woff2)/, loader: 'url-loader?limit=5000'}
  }

  const clientEntry = ['./src/client/client.js']
  const publicPath = '/build/'

  if (isDebug) {
    console.log(`oi`)
  } else {
    plugins.push(
      new ExtractTextPlugin('[name].css'),
      new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false }})
    )

    loaders.css.use = ExtractTextPlugin.extract({ 
      fallback: 'style-loader',
      use: 'css-loader'
    })
    loaders.sass.use = ExtractTextPlugin.extract({
      fallback: 'style-loader', 
      use: ['css-loader', 'sass-loader']
    })
  }

  return {
    name: 'client',
    devtool,
    entry: {
      app: clientEntry,
      vendor
    },
    output: {
      path: path.join(__dirname, 'public', 'build'),
      filename: '[name].js',
      publicPath
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        shared: path.join(__dirname, 'src', 'server', 'shared')
      }
    },
    module: {
      rules: _.values(loaders)
    },
    plugins
  }
}

module.exports = createConfig(process.env.NODE_ENV !== 'production')