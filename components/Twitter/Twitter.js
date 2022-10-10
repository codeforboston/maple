import React from "react"
import styles from "./Twitter.module.css"
import { TwitterTimelineEmbed } from "react-twitter-embed"

function Twitter() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.twitter}>
        <TwitterTimelineEmbed
          screenName="GGovernanceProj"
          sourceType="profile"
        />
      </div>
    </div>
  )
}

export default Twitter
