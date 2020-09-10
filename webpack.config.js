const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HappyPack = require('happypack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const BlogsPlugin = require('./blogsPlugin')

const { ENV } = process.env;
const isPro = ENV === 'production';
const entry = {
  'index': 'src/pages/index/index.js',
  'article': 'src/pages/article/index.js',
}
const hashChoice = isPro ? 'chunkhash:6' : 'hash'

module.exports = {
  entry,

  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: `static/[name].[${hashChoice}].js`
  },

  optimization: {
    namedModules: true,
    namedChunks: true,
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
          vendor: { // 抽离第三方插件
              test: /node_modules/, // 指定是node_modules下的第三方包
              chunks: 'initial',
              name: 'vendor', // 打包后的文件名，任意命名    
              // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
              priority: 10
          }
      }
    },
    minimizer: isPro ? [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,                
        exclude: /\/excludes/,
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({})
    ] : [],
  },

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    inline: true, // 实时刷新
    overlay: true,
    hot: true
  },

  mode: ENV,
  devtool: isPro ? '' : 'cheap-module-eval-source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['happypack/loader?id=happyBabel'],
        exclude: /node_modules/
      },
      {
        // 图片格式正则
        test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            // 配置 url-loader 的可选项
            options: {
              // 这个选项默认开启，会使图片引入失败
              esModule: false,
              // 限制 图片大小 10000B，小于限制会将图片转换为 base64格式
              limit: 10000,
              // 超出限制，创建的文件格式
              name: `static/img/[name].[${hashChoice}].[ext]`
            }
          },
        ]
      },
      // {
      //   test: /\.html$/,
      //   loader: "html-loader",
      //   options: {
      //       attrs: ['link:href'],
      //       root: path.resolve(__dirname, 'src')
      //   }
      // },
      {
        test: /\.(eot|woff2?|ttf|svg)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `static/font/[name].[ext]`
            }
          }
        ]
      },
      // {
      //   test: /pages(\\|\/)index(\\|\/).*\.(css|less)$/,
      //   loader: [
      //     MiniCssExtractPlugin.loader,
      //     { loader: 'css-loader', options: { sourceMap: !isPro } },
      //     { loader: 'less-loader', options: { sourceMap: !isPro } }
      //   ]
      // },
      {
        test: /\.less$/,
        loader: [
          isPro ? MiniCssExtractPlugin.loader : 'style-loader' ,
          { loader: 'css-loader', options: { sourceMap: !isPro } },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('autoprefixer'),
                ...(isPro ? [require('cssnano')] : [])
              ],
              sourceMap: isPro ? false : 'inline'
            }
          },
          { loader: 'less-loader', options: { sourceMap: !isPro, import: true, } }
        ]
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
    ]
  },

  resolve: {
    modules: ['src', 'node_modules'],
    alias: {
      src: path.resolve(__dirname, 'src/'),
    }
  },

  plugins: [
    new webpack.DefinePlugin({
      ENV_IS_PRO: isPro
    }),
    new HappyPack({
      // 用id来标识 happypack处理那里类文件
      id: 'happyBabel',
      // 如何处理  用法和loader 的配置一样
      loaders: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false
                }
              ]
            ]
          }
        }
      ],
      // 共享进程池
      threadPool: happyThreadPool,
      // 允许 HappyPack 输出日志
      verbose: true
    }),
    ...getHtmlPlugins(Object.keys(entry)),
    new HtmlWebpackInlineSourcePlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: `static/[name].[${isPro ? 'contenthash:6' : 'hash'}].css`,
      chunkFilename: `static/[name].[${isPro ? 'contenthash:6' : 'hash'}].css`
    }),
    new CleanWebpackPlugin({
      // cleanStaleWebpackAssets: false // resolve conflict with `CopyWebpackPlugin`
    }),
    // 防止chunk id的频繁改变
    new webpack.HashedModuleIdsPlugin(),
    // 打包自动缓存
    new HardSourceWebpackPlugin(),
    new BlogsPlugin(),

    ...(isPro ? [] : [
      // 要想给bundle命名带上contenthash或者chunkhash，就不能有这个插件
      new webpack.HotModuleReplacementPlugin(),
    ])
  ]
};

function getHtmlPlugins(entrys) {
  return entrys.map(item => new HtmlWebpackPlugin({
    filename: `${item}.html`,
    template: `src/pages/${item}/index.html`,
    chunks: ['runtime', 'vendor', item],
    minify: isPro ? {
      removeAttributeQuotes: true,
      removeComments: true,
      collapseWhitespace: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    } : {},
    // inlineSource: '.(css)$' 
  }))
}


