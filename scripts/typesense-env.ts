import { execSync } from "child_process"
import { createClient } from "../functions/src/search/client"

export const typesenseEnvs: Record<
  string,
  { url: string; key?: string; alias?: string }
> = {
  local: { url: "http://localhost:8108", key: "test-api-key" },
  dev: {
    url: "https://o89yhjf824.execute-api.us-east-1.amazonaws.com/search",
    alias: "default"
  },
  prod: {
    url: "https://yyd73lsw3h.execute-api.us-east-1.amazonaws.com/search",
    alias: "prod"
  }
}

export type TypesenseConnectionArgs = {
  url?: string
  key?: string
  env?: string
}

export function resolveClient(args: TypesenseConnectionArgs) {
  let key: string | undefined, url: string | undefined
  if (args.env) {
    const env = typesenseEnvs[args.env]
    if (!env)
      throw Error(`Invalid env, allowed values: ${Object.keys(typesenseEnvs)}`)
    url = env.url
    if (env.key) {
      key = env.key
    } else if (env.alias) {
      key = execSync(
        `yarn -s firebase --project ${env.alias} functions:secrets:access TYPESENSE_API_KEY`
      )
        .toString()
        .trim()
    } else {
      throw Error("Couldn't resolve env")
    }
  }
  if (args.url) url = args.url
  if (args.key) key = args.key

  if (!url || !key) throw new Error("Couldn't resolve url or key")

  return createClient({ apiUrl: url, apiKey: key })
}
