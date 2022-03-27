const createMyLegislatorEmail = (
  representativeEmail,
  senatorEmail,
  testimonyPosition,
  testimonyContent,
  billNumber,
  billTitle
) => {
  const legislatorEmails =
    representativeEmail && senatorEmail
      ? representativeEmail + "," + senatorEmail
      : representativeEmail
      ? representativeEmail
      : senatorEmail
      ? senatorEmail
      : null

  const currentURL = window.location.href

  const testimonyEmailAddress = "archive@digitaltestimony.com" // in order to have emails send to legislators via BCC, we need a primary email address for each email.  This is a placeholder email address.  If people use an email addres like this for the primary address, we will also have an archive of emails sent to legislators.
  // Emails generated can also be programatically stored in a table,  but the only way to know if someone hit the "send" button is to be sent a copy of the email.

  const positionEmailSubject = !testimonyPosition
    ? null
    : testimonyPosition == "endorse"
    ? "Support of"
    : testimonyPosition == "oppose"
    ? "Opposition to"
    : "Opinion on"

  const positionWord =
    testimonyPosition == "endorse"
      ? "support"
      : testimonyPosition == "oppose"
      ? "oppose"
      : "have thoughts on"

  const mailIntroToLegislator = `As your constituent, I am writing to let you know I ${positionWord} ${billNumber}: ${billTitle}.`

  const emailSuffix = `See more testimony on this bill at ${currentURL}`

  if (!legislatorEmails) return null
  else
    return encodeURI(
      `mailto:${testimonyEmailAddress}?subject=${positionEmailSubject} Bill ${billNumber}&cc=${legislatorEmails}&body=${
        testimonyContent
          ? mailIntroToLegislator +
            "\n\n" +
            testimonyContent +
            "\n\n" +
            emailSuffix
          : ""
      }`
    )
}

export default createMyLegislatorEmail
