import React, { Fragment } from "react";

import SideNavBar from "../SideNavBar/SideNavBar";
import Footer from "../Footer/Footer"
import NavBar from "../NavBar/NavBar";
import styles from "../NewLayout/NewLayout.module.css";

const ViewBill = ({
  pageTitle = "View Bill",
  title = "View Bill",
}) => {
  return (
    <Fragment>
      <title>This is a bill</title>

      <div className={styles.container}>
        <div className={styles.newLayoutFlex}>
          <div className={styles.newLayoutSideNav}>
            <SideNavBar />
          </div>

          <section className={styles.newLayoutContent}>
            <div className={styles.mobileNav}>
              <NavBar />
            </div>

            <div className={styles.imageHeader}>
              <div className={styles.imageText}>{pageTitle}</div>
            </div>

          </section>
        </div>
      </div>
      <Footer/>
    </Fragment>
  );
};

export default ViewBill;

