/**
 * @type {import('@storybook/react/types').StorybookConfig}
 */
module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],

  framework: {
    name: "@storybook/nextjs",
    options: {}
  },

  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.handlebars$/,
      use: ["file-loader"]
    })
    config.resolve.fallback = { fs: false, path: false }
    return config
  },

  staticDirs: ["../public", "../stories/assets"],

  docs: {
    autodocs: false
  }
}
