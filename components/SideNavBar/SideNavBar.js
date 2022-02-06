import React from "react"
import styles from "./SideNavBar.module.css"
import { SignOut, useAuth } from "../auth"
import * as links from "../links"

const SideNavBar = ({}) => {
  const { authenticated } = useAuth()
  return (
    <div className={styles.sideNavBar}>
      {/* TODO: Make this whole thing into an HREF that links to home, not just GGP */}
      {/* <div className={styles.sideNavBarLogo}>
        <a className={styles.sideNavBarLogoHeader} href="/working-new-home">GGP</a>
        <div className={styles.sideNavBarLogoText}>Boston College Clough Center for Constitutional Democracy</div>
      </div> */}

      <div className={styles.sideNavBarLogo}>
        <links.Internal className={styles.sideNavBarLogoHeader} href="/">
          <div>GGP</div>
          <div className={styles.sideNavBarLogoText}>
            Boston College Clough Center for Constitutional Democracy
          </div>
        </links.Internal>
      </div>

      {/* All the items below the logo, spaced for readability */}
      <div className={styles.sideNavBarAllItems}>
        {/* 2021 Section, headers, links to all maps, etc */}

        <div className={styles.sideNavBarItem}>
          <links.Internal href="/democracy-maps">Democracy Maps</links.Internal>
        </div>
        <div className={styles.sideNavBarItemAccent}>
          <links.Internal href="/">2021 Priorities</links.Internal>
        </div>
        <ul className={styles.sideNavBarItemsList}>
          <li className={styles.sideNavBarSubItem}>
            <links.Internal href="/same-day-registration">
              Same Day Registration
            </links.Internal>
          </li>
          <li className={styles.sideNavBarSubItem}>
            <links.Internal href="/absentee-voting">
              No-Excuse Absentee Voting
            </links.Internal>
          </li>
          <li className={styles.sideNavBarSubItem}>
            <links.Internal href="/campaign-finance">
              Publicly Financed Campaigns
            </links.Internal>
          </li>
        </ul>
        <div className={styles.sideNavBarItem}>
          <links.Internal href="/other-legislative-endorsements">
            Other Endorsements
          </links.Internal>
        </div>

        <br />

        {/* About, FAQ, Contact */}
        <div className={styles.sideNavBarItem}>
          <links.Internal href="/about">About</links.Internal>
        </div>

        <div className={styles.sideNavBarItem}>
          <links.Internal href="/disclaimer">Disclaimer</links.Internal>
        </div>
        <div className={styles.sideNavBarItem}>
          <links.Internal href="mailto: GGP.BCLaw@gmail.com">
            Contact Us
          </links.Internal>
        </div>
      </div>

      <br />
      <br />
      {authenticated ? (
        <div className="d-flex flex-column">
          <links.Internal href="/profile" className={styles.sideNavBarItem}>
            Profile
          </links.Internal>
          <SignOut className="d-block" />
        </div>
      ) : (
        <links.Internal href="/login" className={styles.sideNavBarItem}>
          Sign In to Testify
        </links.Internal>
      )}
      <br />
      <br />
      <div className={styles.sideNavBarItem}>
        <p>
          Professors, student groups, public officials, for-profits and
          non-profits can add their position to our map:
        </p>

        <p>
          <links.External
            className={styles.actionButton}
            plain
            href="https://docs.google.com/forms/d/e/1FAIpQLSfpwQoQV2MpIVbaKdIB2D6DKnrxnU4u_MZbFpXBaQgvmcRclg/viewform?usp=sf_link"
          >
            Add your voice &nbsp;
            <i className="fa fa-comment"></i>
          </links.External>
        </p>

        <br />

        <hr />

        <p className={styles.betaThoughts}>
          This platform is in "beta" &ndash; Please provide your thoughts on it
          via our{" "}
          <links.External href="https://docs.google.com/forms/d/e/1FAIpQLSf8R24Ocv_z8F2pUSu6Pp0JxeJsh0-hA_20gTR4Xgg2LR_BYQ/viewform">
            feedback form
          </links.External>
          .
        </p>
      </div>
    </div>
  )
}

export default SideNavBar
