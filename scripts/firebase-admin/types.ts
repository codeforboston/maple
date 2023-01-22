import type { Context } from "../../functions/src/types"
export type { Context } from "../../functions/src/types"

export type ScriptContext = Context & {
  args: {
    env: "local" | "dev" | "prod"
    argv: string[]
    [k: string]: unknown
  }
}
export type Script = (ctx: ScriptContext) => Promise<any>
