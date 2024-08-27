import { test as setup, expect } from "@playwright/test"

const authFile = "playwright/.auth/admin.json"

setup("authenticate", async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto("http://localhost:3000")
  await page.getByRole("button", { name: "Log in / Sign up" }).click()
  await page.getByRole("button", { name: "Sign In", exact: true }).click()
  await page.getByPlaceholder("email").fill("testadmin@example.com")
  await page.getByPlaceholder("password").fill("password")
  await page.click('button[type="submit"]')
  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByAltText("profile icon")).toBeVisible()

  // End of authentication steps.

  await page.context().storageState({ path: authFile })
})
