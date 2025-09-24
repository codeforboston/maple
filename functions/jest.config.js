/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    // This maps firebase-admin/auth to the correct location within node_modules
    "^firebase-admin/auth$":
      "<rootDir>/node_modules/firebase-admin/lib/auth/index.js",
    "^firebase-admin/app$":
      "<rootDir>/node_modules/firebase-admin/lib/app/index.js",
    "^firebase-admin/(.*)$": "<rootDir>/node_modules/firebase-admin/lib/$1"
  }
}
