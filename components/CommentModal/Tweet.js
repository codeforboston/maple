import React from "react"

const Tweet = ({ checkedTweet, setCheckedTweet }) => {
  const handleChangeTweet = () => {
    setCheckedTweet(!checkedTweet)
  }

  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        checked={checkedTweet}
        id="flexTweetCheckChecked"
        onChange={handleChangeTweet}
      />
      <label className="form-check-label">
        Tweet that you provided testimony
      </label>
    </div>
  )
}

export default Tweet
