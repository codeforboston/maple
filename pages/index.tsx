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
          This platform is developed in collaboration between the NuLawLab, Code for Boston, and scholars at the <a href="https://www.bc.edu/bc-web/centers/clough.html">Boston College Clough Center for Constitutional Democracy</a> and  <a href="https://cyber.harvard.edu">Harvard University's Berkman Klein Center for Internet & Society</a>.
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
