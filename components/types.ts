import type { FunctionComponent } from "react"

export type FC<P = {}> = FunctionComponent<P & { className?: string }>
