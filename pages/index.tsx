import Head from "next/head"
import React from "react"
import { useAuth } from "../components/auth"
import { Button, Stack } from "../components/bootstrap"
import { Wrap } from "../components/links"
import { createPage } from "../components/page"

export default createPage({
  v2: true,
  Page: () => {
    const { authenticated } = useAuth()
    return (
      <>
        <Head>
          <title>Digital Testimony Platform</title>
        </Head>
        <h1>Digital Testimony Platform</h1>
        <p>
          A collaboration between the Northeastern Law Lab and Code for Boston
        </p>

        <Stack gap={3} className="col-lg-5 mx-auto">
          <Wrap href="/browse">
            <Button size="lg">View Testimony</Button>
          </Wrap>
          {!authenticated && (
            <Wrap href="/login">
              <Button size="lg">Sign Up To Contribute Testimony</Button>
            </Wrap>
          )}
        </Stack>
      </>
    )
  }
})
