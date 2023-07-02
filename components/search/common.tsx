import { TypesenseInstantsearchAdapterOptions } from "typesense-instantsearch-adapter"

const devConfig = {
  key: "Wk0K3oMIE1ERRmwX0uLgEk3gGEGKNuQe",
  url: "https://o89yhjf824.execute-api.us-east-1.amazonaws.com/search"
}

export function getServerConfig(): TypesenseInstantsearchAdapterOptions["server"] {
  const key = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY ?? devConfig.key
  const url = new URL(
    process.env.NEXT_PUBLIC_TYPESENSE_API_URL ?? devConfig.url
  )

  const protocol = url.protocol.startsWith("https") ? "https" : "http"
  const port = url.port ? Number(url.port) : protocol === "https" ? 443 : 80

  return {
    apiKey: key,
    nodes: [
      {
        host: url.hostname,
        protocol,
        port,
        path: url.pathname
      }
    ]
  }
}
