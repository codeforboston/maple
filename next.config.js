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
 *
 * Set MAPLE_ENV to "prod" to redirect to the production site. This is required
 * in production mode.
 *
 * Set MAPLE_ENV to "dev" to redirect to the development site. This is the
 * default in dev mode. To set up redirection, set MAPLE_DEV environment
 * variable to "dev" or "prod".
 *
 * @see https://firebase.google.com/docs/auth/custom-email-handler
 */
const redirectFirebaseAuthHandlers = () => {
  let firebaseDomain
  if (process.env.MAPLE_ENV === "prod") {
    firebaseDomain = "mapletestimony.org"
  } else if (
    process.env.MAPLE_ENV === "dev" ||
    process.env.NODE_ENV === "development"
  ) {
    firebaseDomain = "digital-testimony-dev.web.app"
  } else {
    throw new Error(
      'NODE_ENV must be "development" or MAPLE_DEV environment variable must be set to "dev" or "prod"'
    )
  }

  return {
    source: "/__/:path*",
    destination: `https://${firebaseDomain}/__/:path*`,
    permanent: false
  }
}
