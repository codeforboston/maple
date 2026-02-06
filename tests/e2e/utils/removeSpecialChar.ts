import { expect, type Locator } from "@playwright/test"

export async function removeSpecialChar(locator: Locator, sample: string) {
  const expected = sample.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  const removing = await expect
    .poll(
      async () => {
        const actual = (await locator.textContent()) ?? ""
        return actual.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strips accents from page text too
      },
      { timeout: 30_000 }
    )
    .toBe(expected)

  return removing
}
