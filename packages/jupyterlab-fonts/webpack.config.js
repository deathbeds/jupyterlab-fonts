let rules = [];

if(JSON.parse((process.env.WITH_JS_COV || '').toLowerCase())) {
  rules.push([
    { test: /\.js$/, use: ['@ephesoft/webpack.istanbul.loader'] },
  ])
}

module.exports = {
  output: { clean: true },
  devtool: 'source-map',
  module: { rules },
};
