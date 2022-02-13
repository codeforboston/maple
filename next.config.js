/**
 * @type {import('next').NextConfig}
 */
const config = {
  images: {
    loader: "custom"
  },
  experimental: {
    styledComponents: true
  },
  eslint: {
    dirs: ["pages", "components", "functions/src"]
  }
}

module.exports = config
