import React from "react"
import * as links from "../links"

const TweetComponent = ({ tweetURL }) => {
  return (
    <>
      <links.External href={tweetURL}>
        Tweet that you provided testimony
      </links.External>
    </>
  )
}

export default TweetComponent
