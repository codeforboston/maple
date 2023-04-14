import { SocialLinks } from ".."

export function cleanSocialLinks(network: keyof SocialLinks, link: string) {
  let path = link
  if (network && network !== "linkedIn") {
    if (path && path.includes(".com/")) {
      const index: number = path.indexOf(".com/") + 5
      path = path.substring(index)
    }
  }

  return path

  // above should cover twitter, facebook, instagram. Need to come up with a solution for linkedin, as individuals (/in/name), companies (/company/name), schools (/school/name) have different subdirectories. Current code on front end links directly to individuals only
}

export function cleanOrgURL(url: string) {
  let parsed = url
  // if (url.includes("www.")) {
  //   const index: number = url.indexOf("www.") + 4
  //   parsed = url.substring(index)
  // else } <-- add back if we want to scrub "www."
  if (url.includes("http://")) {
    const index: number = url.indexOf("http://") + 7
    parsed = url.substring(index)
  } else if (url.includes("https://")) {
    const index: number = url.indexOf("https://") + 8
    parsed = url.substring(index)
  }
  return parsed

  // to streamline entry for users, we will allow orgs to enter their website with or without https:// prefix. If it is entered, this function scrubs it as we are already adding for all org urls.
}
