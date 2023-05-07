import { useRouter } from "next/router"
import { useEffect } from "react"
import { createGetStaticTranslationProps } from "components/translations"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.push("/about/mission-and-goals")
  })

  return null
}

export const getStaticProps = createGetStaticTranslationProps([
  "common",
  "footer"
])
