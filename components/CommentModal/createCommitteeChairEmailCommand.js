const createCommitteeChairEmailCommand = (
  houseChairEmail,
  senateChairEmail,
  committeeName,
  positionWord,
  positionEmailSubject,
  billNumber,
  billTitle,
  testimonyContent,
  emailSuffix,
  testimonyArchiveEmailAddress
) => {
  const committeeEmails =
    houseChairEmail && senateChairEmail
      ? houseChairEmail + "," + senateChairEmail
      : houseChairEmail
      ? houseChairEmail
      : senateChairEmail
      ? senateChairEmail
      : null

  const mailIntroToCommittee = `I am writing to let you know I ${positionWord} bill ${billNumber} ${
    committeeName ? "that is before the " + committeeName : ""
  }.`

  const mailCommandToCommitteeChairs = !committeeEmails
    ? null
    : encodeURI(
        `mailto:${testimonyArchiveEmailAddress}?subject=${positionEmailSubject} Bill ${billNumber}&cc=${committeeEmails}&body=${
          testimonyContent
            ? mailIntroToCommittee +
              "\n\n" +
              testimonyContent +
              "\n\n" +
              emailSuffix
            : ""
        }`
      )
  return mailCommandToCommitteeChairs
}

export default createCommitteeChairEmailCommand
