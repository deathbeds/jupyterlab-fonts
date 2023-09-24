let rules = [];
let plugins = [];

const WITH_JS_COV = !!JSON.parse((process.env.WITH_JS_COV || '').toLowerCase());
const WITH_JS_VIZ = !!JSON.parse((process.env.WITH_JS_VIZ || '').toLowerCase());

if (WITH_JS_COV) {
  console.error('Building with coverage');
  rules.push({ test: /\.js$/, use: ['@ephesoft/webpack.istanbul.loader'] });
}

if (WITH_JS_VIZ) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  const path = require('path');
  const pkg = path.basename(__dirname);
  const reportFilename = path.resolve(__dirname, `../../build/reports/webpack/${pkg}.html`);
  console.error('Building with visualized bundle', reportFilename);
  plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename,
      openAnalyzer: false,
    }),
  );
}

module.exports = {
  output: { clean: true },
  devtool: 'source-map',
  module: { rules },
  plugins,
};
