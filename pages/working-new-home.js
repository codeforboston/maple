import React from 'react';
// import { NewLayout } from '../components'
import NewLayout from '../components/NewLayout/NewLayout'


import styles from "../styles/NewHome.module.css";

import PriorityCard from '../components/PriorityCard/PriorityCard'
import SideNavBar from '../components/SideNavBar/SideNavBar'

const newHome = () => {

  // oh baby we got bootstrap
  return (
    <NewLayout>
      <div>
        Testinggg
        <PriorityCard title="prior-1" />
        <PriorityCard title="prior-2" />
        <PriorityCard title="prior-3" />
      </div>
    </NewLayout>


    // <div className="m-3 container">
    //   <div>
    //     <a href="/">To Home</a>
    //   </div>

    //   <br />

    //   <div className={styles.newHomeFlex}>
    //     <div className={styles.newHomeSideNav}>
    //       <SideNavBar />
    //     </div>
    //     <div className={styles.newHomeContent}>
    //       {/* Hello World! */}
    //       {/* Sample Card Component: */}
    //       <PriorityCard title="prior-1" />
    //       <PriorityCard title="prior-2" />
    //       <PriorityCard title="prior-3" />
    //     </div>
    //   </div>
    // </div>
  );
}

export default newHome;