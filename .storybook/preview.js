// Order is important!
import "../styles/bootstrap.scss"
import "../styles/globals.css"
import "../components/fontawesome"
import "../styles/instantsearch.css"
import "instantsearch.css/themes/satellite.css"

import React, { Suspense } from "react"
import { initReactI18next, I18nextProvider } from "react-i18next"
import HttpApi from "i18next-http-backend"
import i18next from "i18next"
import { useGlobals } from "@storybook/addons"

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}

export const globalTypes = {
  locale: {
    name: "Locale",
    description: "Internationalization locale",
    defaultValue: "en",
    toolbar: {
      icon: "globe",
      items: [{ value: "en", title: "English" }]
    }
  }
}

export const decorators = [
  (Story, Context) => {
    const [{ locale }] = useGlobals()

    i18next
      .use(HttpApi)
      .use(initReactI18next)
      .init({
        whitelist: ["en"],
        lng: locale,
        fallbackLng: "en",
        ns: ["common", "footer"],
        defaultNS: "footer",
        backend: {
          loadPath: "/public/locales/en/footer.json"
          // loadPath: "/public/locales/{{lng}}/{{ns}}.json"
        },
        debug: true
      })

    return (
      <Suspense fallback="Loading...">
        <I18nextProvider i18n={i18next}>
          <Story />
        </I18nextProvider>
      </Suspense>
    )
  }
]
