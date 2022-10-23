module.exports = {
  output: {
    clean: true,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: process.env.WITH_JS_COV
          ? ['@ephesoft/webpack.istanbul.loader']
          : ['source-map-loader'],
      },
    ],
  },
};
