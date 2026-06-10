/**
 * @type {import('@storybook/react/types').StorybookConfig}
 */
const path = require("path")

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

    const path = require("path")
    const webpack = require("webpack")
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /components\/db\/profile\/profile(\.tsx?)?$/,
        path.resolve(__dirname, "../stories/__mocks__/db/profile.ts")
      )
    )

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "firebase/firestore$": path.resolve(
        __dirname,
        "./firebase-guards/firestore.guard.js"
      ),
      "firebase/auth$": path.resolve(
        __dirname,
        "./firebase-guards/auth.guard.js"
      )
    }

    return config
  },

  staticDirs: ["../public", "../stories/assets"],

  docs: {
    autodocs: false
  }
}
