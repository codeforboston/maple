import React from "react";
import styles from "./PriorityCard.module.css";

// Okay so as props we need:
// ===============================
// title: i.e. 'Election Day Registration'
// pathMap: button to link to the map page
// pathLetter: button to link to the letter page
// subHeader: i.e. 'Why Should We Have It"
// text: the whole damb blurb
//
// TODO: subtitle?
// subtitle: one example has subtitle i.e. 'constitutional amendment'
//   lowkey, i don't wanna add logic to respace based on if subtitle
//   exists. add this as a nice-to-have?

const PriorityCard = ({
  title = "DEFAULT-TITLE",
  pathMap = "/",
  pathLetter = "/",
  subHeader = "Why do we need this?",
  text = `Lorem ipsum dolor sit aet, consectetur adipiscing elit, sed do eiusmod
  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
  commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
  velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
  cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
  est laborum.`,
}) => {
  return (
    <div className={styles.priorityCard}>
      {/* Header (Title, Buttons) */}
      <div className={styles.priorityCardHeader}>
        <span className={styles.priorityCardHeaderTitle}>{title}</span>

        <a className={styles.priorityCardHeaderButton} href={pathMap}>
          <i className="fa fa-map-marker"></i>
          &nbsp; View Democracy Map
        </a>

        <a className={styles.priorityCardHeaderButton} href={pathLetter}>
          <i className="fa fa-envelope-open"></i>
          &nbsp; Read Our Full Letter
        </a>
      </div>

      {/* Body (Subtitle, Paragraph) */}
      <div className={styles.priorityCardBody}>
        <strong className={styles.priorityCardBodyHeader}>{subHeader}</strong>
        <p className={styles.priorityCardBodyText}>{text}</p>
      </div>
    </div>
  );
};

export default PriorityCard;

