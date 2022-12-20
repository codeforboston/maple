import { NextRouter } from "next/router"

export const params = {
  string: (router: NextRouter, name: string) => {
    const value = router.query[name]
    return typeof value === "string" && value.length ? value : undefined
  },
  number: (router: NextRouter, name: string) => {
    const value = params.string(router, name)
    if (!value) return
    const num = Number(value)
    if (!isNaN(num)) return num
  }
}
