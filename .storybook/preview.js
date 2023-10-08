// Order is important!
import "../styles/bootstrap.scss"
import "../styles/globals.css"
import "../components/fontawesome"
import "../styles/instantsearch.css"
import "instantsearch.css/themes/satellite.css"

import React, { Suspense } from "react"
import { initReactI18next, I18nextProvider } from "react-i18next"
import HttpApi from "i18next-http-backend"
// import i18n from "i18next"
import i18n from "./i18n"
import { useGlobals } from "@storybook/addons"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { Providers } from "../components/providers"

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}

export const decorators = [
  (Story, context) => {
    
    return (
      <Suspense fallback="Loading...">
        <I18nextProvider i18n={i18n}>
          <Story />
        </I18nextProvider>
      </Suspense>
    )
  }
]
