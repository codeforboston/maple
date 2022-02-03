import React, { Fragment } from "react";
import styles from "../NewLayout/NewLayout.module.css";

const Footer = () => {
  return (
    <div className={styles.democracyPower}>
      <div className={styles.jankyFlex}>
        <div>
          Subscribe to our{" "}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdXHbMqo299lCBiR_rgxSuxd5-DgEiWNpDAFjawLh66263YLw/viewform"
            target="_blank"
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
    )}
    export default Footer;