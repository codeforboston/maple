// https://stackoverflow.com/a/4087530/4531028
const SSN_REGEX_PATTERN = /(?!(000|666|9))\d{3}-(?!00)\d{2}-(?!0000)\d{4}/gm

export function containsSocialSecurityNumber(text: string): boolean {
  return new RegExp(SSN_REGEX_PATTERN).test(text)
}
