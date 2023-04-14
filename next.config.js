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

/** @type {import('next').NextConfig} */
module.exports = {
  ...config,
  async redirects() {
    return [redirectFirebaseAuthHandlers()]
  },
  async rewrites() {
    return [
      {
        source: "/policies",
        destination: "/policies/privacy-policy"
      }
    ]
  }
}

/**
 * Redirect auth handler paths to the hosted firebase pages. This avoids having
 * to implement these pages ourselves in next.js but continues to depend on
 * firebase hosting a bit.
 *b
 * In production, FIREBASE_AUTH_DOMAIN is set to digital-testimony-prod.web.app.
 *
 * @see https://firebase.google.com/docs/auth/custom-email-handler
 */
const redirectFirebaseAuthHandlers = () => {
  const firebaseDomain =
    process.env.FIREBASE_AUTH_DOMAIN ?? "digital-testimony-dev.web.app"

  return {
    source: "/__/:path*",
    destination: `https://${firebaseDomain}/__/:path*`,
    permanent: false
  }
}
