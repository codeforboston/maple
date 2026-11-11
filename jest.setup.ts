/**
 * Setup for the website tests (`yarn test:website`). Not used by the
 * emulator-backed integration tests, which need real connections.
 *
 * Tests here must never reach a real backend. Outbound connections to anything
 * but this machine are refused, and the test that caused one fails, even if the
 * SDK that made it swallows the error.
 */
import net from "net"
import { TextDecoder, TextEncoder } from "util"

Object.assign(global, { TextDecoder, TextEncoder })

// Anything that slips past the guard still can't touch the dev project's data.
process.env.NEXT_PUBLIC_PROJECT_ID_FOR_TEST = "demo-jest-no-network"

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"])

const GUARDED = Symbol.for("maple.jest.networkGuard")
type Guarded = typeof net.Socket.prototype.connect & { [GUARDED]?: string[] }

function targetOf(args: unknown[]): string | undefined {
  // net.connect hands over its already-normalized arguments as one array
  if (Array.isArray(args[0])) args = args[0]
  const [first, second] = args
  let options: { host?: string; path?: string; port?: number } = {}
  if (typeof first === "object" && first !== null) options = first as any
  else if (typeof first === "string" && Number.isNaN(Number(first)))
    options = { path: first }
  else options = { port: Number(first), host: second as string | undefined }

  if (options.path) return undefined
  const host = options.host ?? "localhost"
  return LOCAL_HOSTS.has(host) ? undefined : `${host}:${options.port}`
}

const original = net.Socket.prototype.connect as Guarded
// Core modules are shared between test files in a worker; wrap only once.
const attempts: string[] = (original[GUARDED] ??= [])

if (!(original as any)[Symbol.for("maple.jest.wrapped")]) {
  const guarded = function (this: net.Socket, ...args: unknown[]) {
    const target = targetOf(args)
    if (target) {
      attempts.push(target)
      throw new Error(
        `Blocked a real network connection to ${target}. Website tests must ` +
          `not reach real backends; mock the module that makes the call.`
      )
    }
    return (original as any).apply(this, args)
  } as Guarded
  ;(guarded as any)[Symbol.for("maple.jest.wrapped")] = true
  guarded[GUARDED] = attempts
  net.Socket.prototype.connect = guarded as typeof net.Socket.prototype.connect
}

afterEach(() => {
  const blocked = attempts.splice(0)
  if (blocked.length)
    throw new Error(
      `Test attempted real network connections: ${[...new Set(blocked)].join(
        ", "
      )}`
    )
})
