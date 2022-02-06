import React from "react"
import { requireAuth } from "../components/auth"
import * as links from "../components/links"
import NewLayout from "../components/NewLayout/NewLayout"

const Page = requireAuth(({ user }) => {
  return (
    <NewLayout pageTitle="Profile">
      <p>Hello, {user.displayName}!</p>
      <p>
        Please use the{" "}
        <links.External href="https://malegislature.gov/Search/FindMyLegislator">
          find your legislator
        </links.External>{" "}
        tool and select your State Representative and Senator below
      </p>
    </NewLayout>
  )
})

export default Page
