import net from "net"
import { app } from "./firebase"

// jest.setup.ts fails any test that attempts a real connection, so this one
// clears the attempts it provokes on purpose.
const attempts = () =>
  (net.Socket.prototype.connect as any)[
    Symbol.for("maple.jest.networkGuard")
  ] as string[]

describe("website test network guard", () => {
  const blocked = (host: string) => () =>
    net.connect({ host, port: 443 }).on("error", () => {})

  it("refuses connections to remote hosts", () => {
    expect(blocked("firestore.googleapis.com")).toThrow(
      /Blocked a real network connection to firestore\.googleapis\.com:443/
    )
    expect(blocked("203.0.113.5")).toThrow(/Blocked/)
    expect(attempts()).toHaveLength(2)
    attempts().splice(0)
  })

  it("lets local connections through to fail on their own", async () => {
    const server = net.createServer().listen(0, "127.0.0.1")
    await new Promise(r => server.once("listening", r))
    const { port } = server.address() as net.AddressInfo
    await new Promise<void>((resolve, reject) => {
      const socket = net.connect({ host: "127.0.0.1", port }, () => {
        socket.destroy()
        resolve()
      })
      socket.on("error", reject)
    })
    server.close()
  })

  it("points the Firebase SDK at a project that holds no data", () => {
    expect((app.options as { projectId?: string }).projectId).toBe(
      "demo-jest-no-network"
    )
  })
})
