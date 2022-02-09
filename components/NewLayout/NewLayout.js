import React, { Fragment } from "react"
import Head from "next/head"

import styles from "./NewLayout.module.css"
import SideNavBar from "../SideNavBar/SideNavBar"
import NavBar from "../NavBar/NavBar"
import ViewTestimony from "../ViewBills/ViewBills"
import Footer from "../Footer/Footer"

const NewLayout = ({
  pageTitle = "Digital Testimony",
  title = "Digital Testimony"
}) => {
  return (
    <Fragment>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />

        <meta charSet="utf-8" />
      </Head>

      <div className={styles.container}>
        <div className={styles.newLayoutFlex}>
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

            <ViewTestimony />

            <Footer />
          </section>
        </div>
      </div>
    </Fragment>
  )
}

export default NewLayout
