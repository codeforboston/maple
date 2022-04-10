const createCommitteeChairEmailCommand = (
  houseChairEmail,
  senateChairEmail,
  committeeName,
  positionWord,
  positionEmailSubject,
  billNumber,
  testimonyContent,
  emailSuffix
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
        `mailto:${committeeEmails}?subject=${positionEmailSubject} Bill ${billNumber}&body=${
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
