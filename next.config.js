/**
 * @type {import('next').NextConfig}
 */
const config = {
  images: {
    loader: "custom"
  },
  compiler: {
    styledComponents: true
  },
  eslint: {
    dirs: ["pages", "components", "functions/src", "tests"]
  }
}

module.exports = {
  ...config,
  async redirects() {
    return [
      {
        source: "/learn",
        destination: "/learn/basics-of-testimony",
        permanent: false
      },
      {
        source: "/about",
        destination: "/about/mission-and-goals",
        permanent: false
      }
    ]
  }
}
