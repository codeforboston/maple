import React from 'react';
import Head from 'next/head';

import styles from './NewLayout.module.css';
import SideNavBar from '../SideNavBar/SideNavBar';

const NewLayout = ({
  pageTitle = "Easy To Do Good",
  children,
  title = "Easy To Do Good"
}) => {


  return (
    <div className={styles.container}>

      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />

        {/* 
        TODO: if anyone has a clue on how to NOT use a CDN on every single page, that would be GREAT
        Honestly, I poked around various stack overflow things for ~30 minutes on how to get the damb fontawesome I 
        added via yarn to directly load, but for whatever reason it just didn't want to work, i basically know
        one specific tech stack and how to make it work there lmao 
        Also the ones from the CDN look like dodo, the local package (right term? idk) fontawesome icons are nicer
          - riley
         */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>

        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        {/* TODO: Is there a way to set background color of html? not within a div */}
      </Head>

      <div className={styles.newLayoutFlex}>

        {/* Add sidenav */}
        <div className={styles.newLayoutSideNav}>
          <SideNavBar />
        </div>

        {/* Everything else renders to right of sidenav  */}
        <section className={styles.newLayoutContent}>

          {/* Static head with variable title */}
          <div className={styles.imageHeader}>
            {/* Easy To Do Good */}
            <div className={styles.imageText}>{pageTitle}</div>
          </div>

          {/* Pop all the children in, only variable content */}
          <div className={styles.children}>
            {children}
          </div>

          {/* GGPs favorite footer */}
          <div className={styles.democracyPower}>
            <div className={styles.jankyFlex}>
              <div>Subscribe to our <a href="https://docs.google.com/forms/d/e/1FAIpQLSdXHbMqo299lCBiR_rgxSuxd5-DgEiWNpDAFjawLh66263YLw/viewform" target="_blank"> newsletter</a></div>
              <div>Powered By Democracy</div>
              <div>Contact Us: <a href="mailto: GGP.BCLaw@gmail.com"> GGP.BCLaw@gmail.com</a></div>
            </div>
          </div>

        </section>
      </div>
    </div >
  );

}

export default NewLayout;