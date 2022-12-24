import { useRouter } from "next/router"
import { Present } from "./common"

export const useParams = () => {
  const router = useRouter()
  const params = {
    string: (name: string) => {
      const value = router.query[name]
      return typeof value === "string" && value.length ? value : undefined
    },
    number: (name: string) => {
      const value = params.string(name)
      if (!value) return
      const num = Number(value)
      if (!isNaN(num)) return num
    },
    all: <T extends Record<string, string | number | undefined>>(p: T) => {
      if (Object.values(p).every(Boolean)) return p as Present<T>
    }
  }

  return <T>(builder: (p: typeof params) => T) => builder(params)
}
