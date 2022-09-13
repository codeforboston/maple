import { Client } from "typesense"

export const createClient = (
  apiUrl = process.env.TYPESENSE_API_URL!,
  apiKey = process.env.TYPESENSE_API_KEY!
) => {
  const url = new URL('https://maple.aballslab.com/search') // ! revert
  const protocol = url.protocol.startsWith("https") ? "https" : "http"
  const port = url.port ? Number(url.port) : protocol === "https" ? 443 : 80

  return new Client({
    apiKey: 'n65zE6pZ7bH0EHCL4OhWfDID5Qj7xZuK', // ! revert
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
