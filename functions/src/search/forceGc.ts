import * as v8 from "v8"
import * as vm from "vm"

/** The options V8's GC extension takes for the collection this module needs: a
 * synchronous major collection run as a low-memory notification. The `flavor`
 * is the load-bearing part — the default (`regular`) frees the heap but keeps
 * the pages committed, so RSS does not move.
 *
 * Measured in this loop's shape — allocate a batch of large strings, drop it,
 * collect, twelve times — on node 22 on macOS: RSS plateaus at 751 MB with no
 * forced collection, 670 MB with a bare `gc()` and 582 MB with these options.
 * `heapUsed` sits at ~3 MB at all three plateaus, which is why heap figures
 * cannot tell them apart and the run reports `peakRssAfterGcBytes` instead.
 *
 * Read those as a direction, not a budget. They are macOS, where V8 discards
 * pages with `MADV_FREE_REUSABLE`; the deploy sandbox is Linux, where
 * `MADV_DONTNEED` decrements RSS immediately and should do at least as well —
 * but nobody has measured the sandbox. What keeps a chunk under the ceiling is
 * the memory tier and `batchSize`; this is margin on top of them, and
 * `peakRssAfterGcBytes` tracking `peakRssBytes` on a real run would mean the
 * margin is not there. */
const LAST_RESORT = {
  type: "major",
  execution: "sync",
  flavor: "last-resort"
} as const

/** Runs a full, memory-reducing garbage collection of this process, or does
 * nothing if the runtime will not expose one.
 *
 * Why it exists: the backfill's garbage is bill text — large strings that
 * live in old space and are only reclaimed by a full mark-sweep. V8 schedules
 * those against its own heap limit, which it grows toward geometrically and
 * which need not be below the container's limit, so a chunk can be killed by
 * the container before V8 sees any reason to collect. And a collection alone
 * is not enough: V8 keeps freed pages for reuse and returns them to the OS
 * only when idle, which a warm gen1 instance, CPU-throttled between events,
 * may never be. The kill is measured on resident memory, so both steps have to
 * happen while the chunk still runs — hence `LAST_RESORT` above rather than a
 * bare `gc()`.
 *
 * Exposing `gc` normally needs `--expose-gc` on the command line, which cannot
 * be set for one function, so the flag is set at runtime and `gc` read out of a
 * fresh context, which V8 populates from the flags in force at its creation.
 * The flag is put back immediately: the captured reference keeps working, and
 * no later context in this process silently gains a `gc` global. The function
 * collects the whole isolate, not just that context. Resolved lazily so only
 * the process that calls it flips the flag.
 */
export const forceGc = (): void => (resolved ??= resolve())()

let resolved: (() => void) | undefined

const resolve = (): (() => void) => {
  try {
    v8.setFlagsFromString("--expose-gc")
    const gc = vm.runInNewContext("gc") as (options?: unknown) => void
    v8.setFlagsFromString("--no-expose-gc")
    if (typeof gc !== "function") throw Error("gc is not a function")
    try {
      // Probed once rather than guarded on every call — and the probe is
      // itself the first collection, since resolution happens on the first
      // call, which wanted one anyway. It catches a runtime that rejects the
      // options form outright, but not one that takes the object and ignores
      // it: V8's extension does not validate these keys, so a bogus `flavor`
      // throws nothing on node 22. Neither case can produce a false negative,
      // so the fallback is worth keeping at the price of one call.
      gc(LAST_RESORT)
      return () => gc(LAST_RESORT)
    } catch (error: any) {
      console.warn(
        `Last-resort GC unavailable, falling back to a plain collection; the heap will be freed but RSS will not drop: ${error.message}`
      )
      return () => gc()
    }
  } catch (error: any) {
    console.warn(`Forced GC unavailable, relying on V8's own: ${error.message}`)
    return () => {}
  }
}
