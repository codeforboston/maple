// Order is important!
import "instantsearch.css/themes/satellite.css"
import "../components/fontawesome"
import "../styles/bootstrap.scss"
import "../styles/globals.css"
import "../styles/instantsearch.css"

import React, { Suspense } from "react"
import { I18nextProvider } from "react-i18next"
// import i18n from "i18next"
import i18n from "./i18n"

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
