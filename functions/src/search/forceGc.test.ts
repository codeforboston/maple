import { forceGc } from "./forceGc"

/** The runtime trick — flipping `--expose-gc` after startup and reading `gc`
 * out of a fresh context — is the whole module, so the test is that it works
 * on the Node this runs under: it resolves to a real collector rather than
 * falling back to the no-op, and it can be called repeatedly. */
describe("forceGc", () => {
  it("exposes a real collector at runtime", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
    forceGc()
    forceGc()
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it("reclaims garbage", () => {
    let junk: string[] | undefined = Array.from(
      { length: 2000 },
      (_, n) => "x".repeat(10_000) + n
    )
    forceGc()
    const before = process.memoryUsage().heapUsed
    junk = undefined
    forceGc()
    const after = process.memoryUsage().heapUsed
    expect(junk).toBeUndefined()
    expect(after).toBeLessThan(before)
  })

  /** The heap assertion above passes for a plain `gc()` too — it frees the
   * heap and keeps the pages committed. The container kills on RESIDENT
   * memory, so the collection has to hand the pages back as well, and only the
   * last-resort flavor does. Asserted as a fraction of the growth rather than
   * an absolute figure, since RSS carries whatever else the worker is holding;
   * the real reclaim is ~98% of it, and a plain `gc()` reclaims none. */
  it("returns the pages it reclaims to the OS", () => {
    forceGc()
    const base = process.memoryUsage().rss
    let junk: string[] | undefined = Array.from(
      { length: 20_000 },
      (_, n) => "x".repeat(10_000) + n
    )
    const peak = process.memoryUsage().rss
    junk = undefined
    forceGc()
    const after = process.memoryUsage().rss

    expect(junk).toBeUndefined()
    const growth = peak - base
    expect(growth).toBeGreaterThan(4 * 1024 * 1024)
    expect(peak - after).toBeGreaterThan(growth / 4)
  })
})
