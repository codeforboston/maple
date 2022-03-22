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
        <p>
          The Massachusetts Archive of Transparent Testimony (MATT) makes it
          easier for anyone to submit and see testimony to the{" "}
          <a href="https://malegislature.gov">Massachusetts Legislature</a>{" "}
          about the bills that will shape our future.
        </p>
        <p>
          MATT is free to use and open source.{" "}
          <a href="/about">This platform is developed in collaboration</a>{" "}
          between the NuLawLab, Code for Boston, and scholars at the{" "}
          <a href="https://www.bc.edu/bc-web/centers/clough.html">
            BC's Clough Center
          </a>{" "}
          and <a href="https://cyber.harvard.edu">Harvard BKC</a>.
        </p>

        <Stack gap={3} className="col-lg-5 mx-auto">
          <Wrap href="/bills">
            <Button size="lg">View Bills</Button>
          </Wrap>
          <Wrap href="/testimonies">
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
