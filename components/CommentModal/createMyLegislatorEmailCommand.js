const createMyLegislatorEmailCommand = (
  representativeEmail,
  senatorEmail,
  positionWord,
  positionEmailSubject,
  billNumber,
  billTitle,
  testimonyContent,
  emailSuffix
) => {
  const legislatorEmails =
    representativeEmail && senatorEmail
      ? representativeEmail + "," + senatorEmail
      : representativeEmail
      ? representativeEmail
      : senatorEmail
      ? senatorEmail
      : null

  const mailIntro = `As your constituent, I am writing to let you know I ${positionWord} ${billNumber}: ${billTitle}.`

  const mailCommandToLegislators = !legislatorEmails
    ? null
    : encodeURI(
        `mailto:${legislatorEmails}?subject=${positionEmailSubject} Bill ${billNumber}&body=${
          testimonyContent
            ? mailIntro + "\n\n" + testimonyContent + "\n\n" + emailSuffix
            : ""
        }`
      )
  return mailCommandToLegislators
}

export default createMyLegislatorEmailCommand
