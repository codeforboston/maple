import i18n from "i18next"
import HttpApi from "i18next-http-backend"
import { initReactI18next } from "react-i18next"

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init(
    {
      whitelist: ["en"],
      lng: ["en"],
      fallbackLng: "en",
      ns: ["common"],
      defaultNS: "common",
      debug: true
    },
    err => console.log(err)
  )

export default i18n
