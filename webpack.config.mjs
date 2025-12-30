import path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

const isProduction = process.env.NODE_ENV === 'production'

// Resolve symlinks to real paths for aliases
const nodeModules = path.resolve(process.cwd(), 'node_modules')
const solidUiJssPath = fs.realpathSync(path.join(nodeModules, 'solid-ui-jss'))
const solidLogicJssPath = fs.realpathSync(path.join(nodeModules, 'solid-logic-jss'))
const solidPanesJssPath = fs.realpathSync(path.join(nodeModules, 'solid-panes-jss'))

// Use ESM versions to avoid UMD global dependency issues
const solidUiJssEsm = path.join(solidUiJssPath, 'dist/solid-ui.esm.js')
const solidLogicJssEsm = path.join(solidLogicJssPath, 'dist/solid-logic.esm.js')

export default {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: isProduction ? 'solid-shim.min.js' : 'solid-shim.js',
    library: {
      name: 'SolidShim',
      type: 'umd',
      umdNamedDefine: true
    },
    globalObject: 'this',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // Search solid-shim's node_modules first for all module resolution
    modules: [
      path.resolve(process.cwd(), 'node_modules'),
      'node_modules'
    ],
    alias: {
      // Map pane package globals to ESM modules (avoid UMD global issues)
      '$rdf': 'rdflib',
      'UI': solidUiJssEsm,
      'SolidLogic': solidLogicJssEsm,
      // Explicitly map JSS packages to ESM versions
      'solid-ui-jss': solidUiJssEsm,
      'solid-logic-jss': solidLogicJssEsm,
      'solid-panes-jss': solidPanesJssPath,
      // Redirect original packages to JSS versions
      'solid-logic': solidLogicJssEsm,
      'solid-ui': solidUiJssEsm
    },
    fallback: {
      // Node.js polyfills for browser
      buffer: false,
      crypto: false,
      stream: false,
      path: false,
      fs: false
    }
  },
  plugins: [
    // Replace jose CDN URL with local package
    new webpack.NormalModuleReplacementPlugin(
      /^https:\/\/esm\.sh\/jose@5$/,
      'jose'
    ),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Solid Shim - Data Browser'
    })
  ],
  optimization: {
    minimize: isProduction,
    minimizer: [new TerserPlugin({ extractComments: false })]
  },
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  devServer: {
    static: {
      directory: path.resolve(process.cwd(), 'dist')
    },
    port: 8080,
    hot: true,
    open: true
  }
}
