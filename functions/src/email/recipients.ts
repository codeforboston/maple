const PRODUCTION_PROJECT = "digital-testimony-prod"

const isProduction = () => process.env.GCLOUD_PROJECT === PRODUCTION_PROJECT

/** Who an email to real people actually goes to. Outside production no email
 * reaches them: the To line becomes the one configured test address
 * (`LETTER_TEST_RECIPIENT`), and the subject says who it would have gone to,
 * so a test also checks routing. With no test address configured, or no one
 * to stand in for, nothing is sent. */
export const resolveRecipients = (
  real: string[]
): { to: string[]; subjectPrefix: string } => {
  if (!real.length) return { to: [], subjectPrefix: "" }
  if (isProduction()) return { to: real, subjectPrefix: "" }
  const test = process.env.LETTER_TEST_RECIPIENT
  return {
    to: test ? [test] : [],
    subjectPrefix: `[dev] would have gone to: ${real.join(", ")} — `
  }
}
