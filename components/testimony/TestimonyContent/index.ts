import dynamic from "next/dynamic"
import type { Props } from "./TestimonyContent"

export const TestimonyContent = dynamic<Props>(
  () => import("./TestimonyContent").then(m => m.TestimonyContent),
  { ssr: false }
)
