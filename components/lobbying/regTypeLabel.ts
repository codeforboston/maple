// Stored regType values ("Lobbyist", "Employer" for a SoS "Lobbyist Entity")
// shown with clearer labels.
export function regTypeLabel(
  regType: string,
  t: (key: string) => string
): string {
  if (regType === "Employer") return t("registrantType.employer")
  if (regType === "Lobbyist") return t("registrantType.lobbyist")
  return regType
}
