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
    dirs: ["pages", "components", "functions/src", "tests"]
  }
}

module.exports = config
