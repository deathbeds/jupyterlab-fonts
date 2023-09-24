let rules = [];

const WITH_JS_COV = !!JSON.parse((process.env.WITH_JS_COV || '').toLowerCase());
console.error('Building with coverage', WITH_JS_COV);

if (WITH_JS_COV) {
  rules.push({ test: /\.js$/, use: ['@ephesoft/webpack.istanbul.loader'] });
}

module.exports = {
  output: { clean: true },
  devtool: 'source-map',
  module: { rules },
};
