// jest.resolver.js
module.exports = (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    // Use packageFilter to process parsed `package.json` before the resolution (see https://www.npmjs.com/package/resolve#resolveid-opts-cb)
    packageFilter: pkg => {
      const pkgNamesToTarget = new Set([
        "@google-cloud/storage",
        "@firebase/analytics",
        "@firebase/app",
        "@firebase/auth",
        "@firebase/component",
        "@firebase/functions",
        "@firebase/installations",
        "@firebase/logger",
        "@firebase/storage",
        "@firebase/functions",
        "@firebase/auth-compat",
        "@firebase/app-compat",
        "@firebase/compat",
        "@firebase/auth-compat",
        "@firebase/firestore",
        "@firebase/firestore-compat",
        "@firebase/functions-compat",
        "@firebase/messaging",
        "@firebase/util",
        "firebase",
        "firebase/admin",
        "firebase/auth",
        "firebase/firestore",
        "firebase/functions",
        "firebase/storage",
        "uuid",
        "nanoid"
      ])

      if (pkgNamesToTarget.has(pkg.name)) {
        // console.log(">>>", pkg.name)
        delete pkg["exports"]
        delete pkg["module"]
      }

      return pkg
    }
  })
}
