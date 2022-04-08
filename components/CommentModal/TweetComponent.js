import React from "react"
import * as links from "../links"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { TwitterShareButton } from "react-twitter-embed"

const TweetComponent = ({ tweetURL }) => {
  return (
    <>
      <FontAwesomeIcon icon={TwitterShareButton} />
      {/* icon not working */}
      <links.External href={tweetURL}>
        Tweet that you provided testimony
      </links.External>
    </>
  )
}

export default TweetComponent
