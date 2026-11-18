import { PolicyAboutPage } from "./PolicyAboutPage"

const policies = ["privacy-policy", "copyright", "code-of-conduct"] as const
export type Policy = (typeof policies)[number]

/** Each policy as its own page under Policies (PolicyAboutPage). */
export default function PolicyPage({
  policy = "privacy-policy"
}: {
  policy?: Policy
}) {
  return <PolicyAboutPage policy={policy} />
}
