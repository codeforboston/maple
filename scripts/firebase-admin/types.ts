import type { Context } from "../../functions/src/types"
export type { Context } from "../../functions/src/types"

export type ScriptContext = Context & {
  args: {
    argv: string[]
    [k: string]: unknown
  }
}
export type Script = (ctx: ScriptContext) => Promise<any>
