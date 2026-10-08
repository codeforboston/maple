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
const { mockLoggedOutAuthState } = require("./firebase-guards/auth.guard.js")

mockLoggedOutAuthState()

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  },
  options: {
    storySort: {
      order: [
        "Atoms",
        "Molecules",
        "Organisms",
        [
          "Page Elements",
          "Profile",
          "Edit Profile",
          "Bill Detail",
          "Education",
          "Newsfeed"
        ],
        "Pages",
        "*",
        "unused"
      ],
      method: "alphabetical"
    }
  },
  backgrounds: {
    // "page" is transparent on purpose, so the body background set by the
    // active skin shows through instead of being painted over. The fixed
    // values are still here for checking contrast against extremes.
    default: "page",
    values: [
      {
        name: "page",
        value: "transparent"
      },
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

export const globalTypes = {
  mapleSkin: {
    name: "Skin",
    description: "Which set of design token values to render with",
    defaultValue: "maple",
    toolbar: {
      icon: "paintbrush",
      dynamicTitle: true,
      items: [
        { value: "maple", title: "Maple (current)" },
        { value: "dd", title: "Digital Democracy" },
        { value: "mixed", title: "Mixed" }
      ]
    }
  },
  explorerArt: {
    name: "Explorer art",
    description:
      "The explorers' illustrations (Digital Democracy and Mixed skins only)",
    defaultValue: "on",
    toolbar: {
      icon: "photo",
      dynamicTitle: true,
      items: [
        { value: "on", title: "Explorer art on" },
        { value: "off", title: "Explorer art off" }
      ]
    }
  }
}

/**
 * Sets the skin attribute on the document the stories render in. The token
 * overrides live in styles/bootstrap.scss under [data-maple-theme="dd"], so
 * every component reading var(--maple-*) follows without knowing about this.
 */
const SkinProvider = ({ skin, art, children }) => {
  React.useEffect(() => {
    // Read by components/shared/PageArt.tsx and the other explorer art.
    if (art === "off")
      document.documentElement.setAttribute("data-maple-art", "off")
    else document.documentElement.removeAttribute("data-maple-art")
  }, [art])

  React.useEffect(() => {
    const root = document.documentElement
    // "mixed" is the Digital Democracy skin plus a navbar rule (neutral on the
    // homepage, blue elsewhere) that components/Navbar.tsx reads.
    root.setAttribute("data-maple-theme", skin === "maple" ? "maple" : "dd")
    if (skin === "mixed") root.setAttribute("data-maple-nav", "mixed")
    else root.removeAttribute("data-maple-nav")
  }, [skin])

  return children
}

export const decorators = [
  (Story, context) => {
    if (typeof window !== "undefined") {
      window.__MAPLE_STORYBOOK_ALLOW_FIREBASE__ = Boolean(
        context?.parameters?.firebaseGuard?.allow
      )
    }

    return (
      <Suspense fallback="Loading...">
        <I18nextProvider i18n={i18n}>
          <SkinProvider
            skin={context.globals.mapleSkin ?? "maple"}
            art={context.globals.explorerArt ?? "on"}
          >
            <Story />
          </SkinProvider>
        </I18nextProvider>
      </Suspense>
    )
  }
]
