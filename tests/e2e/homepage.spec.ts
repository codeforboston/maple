import { test, expect, type Page } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000")
})

test.describe("Maple Homepage", () => {
  test("should display logo and text", async ({ page }) => {
    const logo = page.getByAltText("logo").first()
    await expect(logo).toBeVisible()
    await expect(page.getByText("Let your voice be heard!")).toBeVisible()
  })
})
