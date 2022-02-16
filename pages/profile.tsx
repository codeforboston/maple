import React from "react"
import { requireAuth } from "../components/auth"
import * as links from "../components/links"
import { createPage } from "../components/page"
import SelectLegislators from "../components/SelectLegislators"

export default createPage({
  v2: true,
  title: "Profile",
  Page: requireAuth(({ user }) => {
    return (
      <>
        <h1>Hello, {user.displayName}!</h1>
        <p>
          Please use the{" "}
          <links.External href="https://malegislature.gov/Search/FindMyLegislator">
            find your legislator
          </links.External>{" "}
          tool and select your State Representative and Senator below.
        </p>
        <SelectLegislators />
      </>
    )
  })
})
