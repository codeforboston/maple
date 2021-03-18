import React from 'react';
import styles from './PriorityCard.module.css';

// // Font Awesome CSS
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>

const PriorityCard = ({
  title = "DEFAULT-TITLE",
  text = 
  `Lorem ipsum dolor sit aet, consectetur adipiscing elit, sed do eiusmod 
  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea 
  commodo consequat. Duis aute irure dolor in reprehenderit in voluptate 
  velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat 
  cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id 
  est laborum.`,
}) => {

  return (
    <div className={styles.priorityCard}>
      <div className={styles.priorityCardHeader}>
        <span className={styles.priorityCardHeaderTitle}>{title}</span>
        <a className={styles.priorityCardHeaderButton} a="#">View Advocacy Map</a>
        <a className="btn btn-primary" a="#">
          <i className="fa fa-code"></i>
          Read Our Full Letter
          </a>
      </div>
      <div className={styles.priorityCardBody}>
        <b>#DEFAULT-SUBHEADER</b>
        <p>{text}</p>
      </div>
      {/* <div>{title}</div> */}
      {/* <div>{text}</div> */}
      <div><i className="fas fa-times"></i></div>
    </div>
  );
}

export default PriorityCard;