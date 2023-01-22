import dynamic from "next/dynamic"

export const TestimonyContent = dynamic(
  () => import("./TestimonyContent").then(m => m.TestimonyContent),
  { ssr: false }
)
