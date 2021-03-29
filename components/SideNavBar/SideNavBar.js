import React from 'react';
import styles from './SideNavBar.module.css';

const SideNavBar = ({

}) => {

  return (
    <div className={styles.sideNavBar}>

      {/* TODO: Make this whole thing into an HREF that links to home, not just GGP */}
      {/* <div className={styles.sideNavBarLogo}>
        <a className={styles.sideNavBarLogoHeader} href="/working-new-home">GGP</a>
        <div className={styles.sideNavBarLogoText}>Boston College Clough Center for Constitutional Democracy</div>
      </div> */}

      <div className={styles.sideNavBarLogo}>
        <a className={styles.sideNavBarLogoHeader} href="/">
          <div>GGP</div>
          <div className={styles.sideNavBarLogoText}>Boston College Clough Center for Constitutional Democracy</div>
        </a>
      </div>

      {/* All the items below the logo, spaced for readability */}
      <div className={styles.sideNavBarAllItems}>

        {/* 2021 Section, headers, links to all maps, etc */}
  
        <div className={styles.sideNavBarItem}>
          <a href="/democracy-maps">Democracy Maps</a>
        </div>
        <div className={styles.sideNavBarItemAccent}>
          <a href="/">2021 Priorities</a>
        </div>
        <ul className={styles.sideNavBarItemsList}>
          <li className={styles.sideNavBarSubItem}>
            <a href="/election-day-registration">Same Day Registration</a>
          </li>
          <li className={styles.sideNavBarSubItem}>
            <a href="/early-mail-voting">No-Excuse Absentee Voting</a>
          </li>
          <li className={styles.sideNavBarSubItem}>
            <a href="/campaign-finance">Publicly Financed Campaigns</a>
          </li>
        </ul>
        <div className={styles.sideNavBarItem}>
          <a href="/other-legislative-endorsements">Other Endorsements</a>
        </div>

        <br/>

        {/* About, FAQ, Contact */}
        <div className={styles.sideNavBarItem}>
          <a href="/about">About</a>
        </div>
        <div className={styles.sideNavBarItem}>
          <a href="/disclaimer">Disclaimer</a>
        </div>
        <div className={styles.sideNavBarItem}>
          <a href="mailto: GGP.BCLaw@gmail.com">Contact Us</a>
        </div>

      </div>

      <br/>
      <br/>

      <div className={styles.sideNavBarItem}>


        <p>Professors, student groups, public officials, for-profits and non-profits can add their position to our map:</p>

        <p>
          <a className={styles.actionButton} target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSfpwQoQV2MpIVbaKdIB2D6DKnrxnU4u_MZbFpXBaQgvmcRclg/viewform?usp=sf_link">
            Add your voice
            &nbsp;
            <i className="fa fa-comment"></i>
          </a>
        </p>

        <br/>

        <hr/>

        <p className={styles.betaThoughts}>
          This platform is in "beta" &ndash; Please provide your thoughts on it via our <a target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSf8R24Ocv_z8F2pUSu6Pp0JxeJsh0-hA_20gTR4Xgg2LR_BYQ/viewform">feedback form</a>.
        </p>
      </div>
          

        
      </div>

  );

}

export default SideNavBar;
