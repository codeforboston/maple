import {
  testimonyEmailAddress,
  positionEmailSubject,
  positionWord,
  emailSuffix,
  currentURL
} from "./emailValues"

const createCommitteeChairEmail = (
  houseChairEmail,
  senateChairEmail,
  committeeName,
  testimonyPosition,
  testimonyContent,
  billNumber,
  billTitle
) => {
  const committeeEmails =
    houseChairEmail && senateChairEmail
      ? houseChairEmail + "," + senateChairEmail
      : houseChairEmail
      ? houseChairEmail
      : senateChairEmail
      ? senateChairEmail
      : null

  const mailIntroToCommittee = `I am writing to let you know I ${positionWord(
    testimonyPosition
  )} ${billNumber}: ${billTitle} ${
    committeeName ? "that is before the " + committeeName : ""
  }.`

  if (!committeeEmails) return null
  else
    return encodeURI(
      `mailto:${testimonyEmailAddress()}?subject=${positionEmailSubject(
        testimonyPosition
      )} Bill ${billNumber}&cc=${committeeEmails}&body=${
        testimony
          ? mailIntroToCommittee +
            "\n\n" +
            testimonyContent +
            "\n\n" +
            emailSuffix(currentURL)
          : ""
      }`
    )
}

export default createCommitteeChairEmail
