import { Locator, type Page } from "@playwright/test"

export async function gotoStable(page: Page, url: string) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 })
  } catch (e: any) {
    // Firefox aborts when a redirect/navigation interrupts the request
    const msg = String(e?.message ?? e)
    if (!msg.includes("NS_BINDING_ABORTED")) throw e
  }

  await page.waitForLoadState("domcontentloaded", { timeout: 60_000 })
}
