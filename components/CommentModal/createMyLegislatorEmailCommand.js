const createMyLegislatorEmailCommand = (
  representativeEmail,
  senatorEmail,
  positionWord,
  positionEmailSubject,
  billNumber,
  billTitle,
  testimonyContent,
  emailSuffix,
  testimonyArchiveEmailAddress
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
        `mailto:${testimonyArchiveEmailAddress}?subject=${positionEmailSubject} Bill ${billNumber}&cc=${legislatorEmails}&body=${
          testimonyContent
            ? mailIntro + "\n\n" + testimonyContent + "\n\n" + emailSuffix
            : ""
        }`
      )
  return mailCommandToLegislators
}

export default createMyLegislatorEmailCommand
