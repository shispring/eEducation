const path = require('path');

module.exports = (storybookBaseConfig, configType, defaultConfig) => {
  defaultConfig.module.rules.push({
    test: /(scss|sass)$/,
    use: [
      {
        loader: 'style-loader'
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
        },
      },
      {
        loader: 'sass-loader'
      }
    ]
  });

  return defaultConfig;
};