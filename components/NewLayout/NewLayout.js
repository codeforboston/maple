import React from 'react';
import Head from 'next/head';

import styles from './NewLayout.module.css';
import SideNavBar from '../SideNavBar/SideNavBar';

const NewLayout = ({
  pageTitle,
  children,
  title = "Easy To Do Good"
}) => {


  return (
    <div className={styles.container}>

      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <div className={styles.newLayoutFlex}>
        <div className={styles.newLayoutSideNav}>
          <SideNavBar />
        </div>
        <section className={styles.newLayoutContent}>
          {children}
          {/* Hello World! */}
          {/* Sample Card Component: */}
          {/* <PriorityCard title="prior-1" />
          <PriorityCard title="prior-2" />
          <PriorityCard title="prior-3" /> */}
        </section>
      </div>

      




    </div>
  );

}

export default NewLayout;