import React, { Fragment } from "react"
import Head from "next/head"

import styles from "./NewLayout.module.css"
import SideNavBar from "../SideNavBar/SideNavBar"
import NavBar from "../NavBar/NavBar"

const NewLayout = ({
  pageTitle = "Easy To Do Good",
  children,
  title = "Easy To Do Good"
}) => {
  return (
    <Fragment>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />

        <meta charSet="utf-8" />
        {/* TODO: Is there a way to set background color of html? not within a div */}
      </Head>

      <div className={styles.container}>
        <div className={styles.newLayoutFlex}>
          {/* Add sidenav */}
          <div className={styles.newLayoutSideNav}>
            <SideNavBar />
          </div>

          {/* Everything else renders to right of sidenav  */}
          <section className={styles.newLayoutContent}>
            <div className={styles.mobileNav}>
              <NavBar />
            </div>

            {/* Static head with variable title */}
            <div className={styles.imageHeader}>
              {/* Easy To Do Good */}
              <div className={styles.imageText}>{pageTitle}</div>
            </div>

            {/* Pop all the children in, only variable content */}
            <div className={styles.children}>{children}</div>

            {/* GGPs favorite footer */}
            <div className={styles.democracyPower}>
              <div className={styles.jankyFlex}>
                <div>
                  Subscribe to our{" "}
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdXHbMqo299lCBiR_rgxSuxd5-DgEiWNpDAFjawLh66263YLw/viewform"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {" "}
                    newsletter
                  </a>
                </div>
                <div>Powered By Democracy</div>
                <div>
                  Contact Us:{" "}
                  <a href="mailto: GGP.BCLaw@gmail.com"> GGP.BCLaw@gmail.com</a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Fragment>
  )
}

export default NewLayout
