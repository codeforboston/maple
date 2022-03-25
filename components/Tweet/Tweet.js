import React from "react"
import { TwitterShareButton } from "react-twitter-embed"

const Tweet = () => {
  return (
    <div className="centerContent">
      <div className="selfCenter spaceBetween">
        <TwitterShareButton
          onLoad={function noRefCheck() {}}
          options={{
            text: "I just provided digital testimony on Bill H100 at "
            // via: "saurabhnemade"
          }}
          url="https://digital-testimony-dev.web.app/bill?id=H100"
          // url="https://facebook.com/saurabhnemade"
        />
      </div>
    </div>
  )
}

export default Tweet
