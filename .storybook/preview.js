// Order is important!
import "../styles/bootstrap.scss"
import "../styles/globals.css"
import "../components/fontawesome"
import "../styles/instantsearch.css"
import "instantsearch.css/themes/satellite.css"

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
  },
  backgrounds: {
    default: "medium",
    values: [
      {
        name: "light",
        value: "#ffffff"
      },
      {
        name: "dark",
        value: "#000000"
      },
      {
        name: "medium",
        value: "#f4f4f4"
      }
    ]
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
