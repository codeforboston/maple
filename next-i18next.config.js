/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  debug: Boolean(process.env.I18N_DEBUG),
  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },
  localePath:
    typeof window === "undefined"
      ? require("path").resolve("./public/locales")
      : "/locales",
  reloadOnPrerender: process.env.NODE_ENV === "development"
}
