import React from 'react';
import styles from './SideNavBar.module.css';

const SideNavBar = ({

}) => {

  return (
    <div className={styles.sideNavBar}>

      <div className={styles.sideNavBarLogo}>
        <a className={styles.sideNavBarLogoHeader} href="/working-new-home">GGP</a>
        <div className={styles.sideNavBarLogoText}>Boston College Clough Center for Constitutional Democracy</div>
      </div>

      {/* All the items below the logo, spaced for readability */}
      <div className={styles.sideNavBarAllItems}>

        {/* 2021 Section, headers, links to all maps, etc */}
        <div className={styles.sideNavBarItemAccent}>2021 Priorities</div>
        <div className={styles.sideNavBarItem}>Democracy Maps</div>
        <ul className={styles.sideNavBarItemsList}>
          <li className={styles.sideNavBarSubItem}>
            <a href="/">Election Day Registration</a>
          </li>
          <li className={styles.sideNavBarSubItem}>
            <a href="/">Early Mail Voting</a>
          </li>
          <li className={styles.sideNavBarSubItem}>
            <a href="/">Publically Financed Campaigns</a>
          </li>
        </ul>
        <div className={styles.sideNavBarItem}>
          <a href="/">Other Endorsements</a>
        </div>

        <br/>

        {/* About, FAQ, Contact */}
        <div className={styles.sideNavBarItem}>
          <a href="/">About</a>
        </div>
        <div className={styles.sideNavBarItem}>
          <a href="/">FAQ</a>
        </div>
        <div className={styles.sideNavBarItem}>
          <a href="/">Contact</a>
        </div>

      </div>


        
      </div>

  );

}

export default SideNavBar;