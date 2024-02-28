import type { FunctionComponent } from "react"

export type FC<P = {}> = FunctionComponent<
  React.PropsWithChildren<P & { className?: string }>
>
