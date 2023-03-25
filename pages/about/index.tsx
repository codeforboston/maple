import { useRouter } from "next/router"
import { useEffect } from "react"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.push("/about/mission-and-goals")
  })

  return null
}

// this must only be on pages in the pages folder
// it will throw an error if it's in the components folder

import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "footer"]))
      // Will be passed to the page component as props
    }
  }
}
