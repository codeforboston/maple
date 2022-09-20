import { Client } from "typesense"
import { TypesenseInstantsearchAdapterOptions } from "typesense-instantsearch-adapter"

const devConfig = {
  key: "n65zE6pZ7bH0EHCL4OhWfDID5Qj7xZuK",
  url: "https://maple.aballslab.com/search"
}

export const getServerConfig =
  (): TypesenseInstantsearchAdapterOptions["server"] => {
    const key =
      process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY ?? devConfig.key
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

export const createClient = () => new Client(getServerConfig())
