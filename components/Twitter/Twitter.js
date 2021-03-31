import React from 'react'
import styles from './Twitter.module.css'

function Twitter() {
    return (
        <div className={styles.sidebar}>
            <div className={styles.twitter}>
                <a className="twitter-timeline" href="https://twitter.com/GGovernanceProj?ref_src=twsrc%5Etfw">Tweets by GGovernanceProj</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
            </div>
        </div>
    )
}

export default Twitter
