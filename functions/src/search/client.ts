import { Client } from "typesense"

export const createClient = (
  apiUrl = process.env.TYPESENSE_API_URL!,
  apiKey = process.env.TYPESENSE_API_KEY!
) => {
  const url = new URL(apiUrl)
  const protocol = url.protocol.startsWith("https") ? "https" : "http"
  const port = url.port ? Number(url.port) : protocol === "https" ? 443 : 80

  return new Client({
    apiKey,
    nodes: [
      {
        host: url.hostname,
        protocol,
        port,
        path: url.pathname
      }
    ]
  })
}
