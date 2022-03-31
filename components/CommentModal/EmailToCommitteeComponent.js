import React from "react"

const EmailToCommittee = ({
  checkedSendToCommittee,
  setCheckedSendToCommittee,
  committeeName
}) => {
  const handleChangeSendToCommittee = () => {
    setCheckedSendToCommittee(!checkedSendToCommittee)
  }

  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        checked={checkedSendToCommittee}
        id="flexCheckChecked"
        onChange={handleChangeSendToCommittee}
        disabled={!committeeName}
      />
      <label className="form-check-label" htmlFor="flexCheckChecked">
        Send copy to relevant committee
      </label>
    </div>
  )
}

export default EmailToCommittee
