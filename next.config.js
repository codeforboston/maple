/**
 * @type {import('next').NextConfig}
 */

const i18Config = require("./next-i18next.config")

const config = {
  images: {
    loader: "custom"
  },
  compiler: {
    styledComponents: true
  },
  eslint: {
    dirs: ["pages", "components", "functions/src", "tests", "analysis"]
  },
  i18n: i18Config.i18n
}

module.exports = {
  ...config
}
