import { expect, Page, Browser } from "@playwright/test"

//login helper function
export async function userLogin(
  page: Page,
  USER_EMAIL: string | undefined,
  USER_PASSWORD: string | undefined
) {
  if (!USER_EMAIL || !USER_PASSWORD) {
    throw new Error("Email or password are not defined.")
  }

  await page.goto("http://localhost:3000", {
    waitUntil: "commit",
    timeout: 60_000
  })

  const loginButton = page.getByRole("button", { name: "Log in / Sign up" })

  const loggedInMarker = page.locator('a:has(img[alt="profileMenu"])')

  const state = await expect
    .poll(
      async () => {
        if (await loggedInMarker.isVisible().catch(() => false))
          return "logged-in"
        const count = await loginButton.count().catch(() => 0)
        if (count > 0) return "needs-login"
        return "loading"
      },
      { timeout: 30_000 }
    )
    .not.toBe("loading")

  // If already logged in, do nothing
  if (await loggedInMarker.isVisible().catch(() => false)) return

  await loginButton.click()

  await page
    .getByLabel("Sign Up or Sign In")
    .getByRole("button", { name: "Sign In", exact: true })
    .click()

  const signInForm = page.getByRole("dialog", { name: "Sign In" })
  const emailInput = signInForm.locator('input[name="email"]')
  const passwordInput = signInForm.locator('input[name="password"]')
  const signInButton = signInForm.locator('button[type="submit"]')

  await emailInput.waitFor({ state: "visible", timeout: 5000 })
  await emailInput.fill(USER_EMAIL)

  await passwordInput.waitFor({ state: "visible", timeout: 5000 })
  await passwordInput.fill(USER_PASSWORD)

  await expect(signInButton).toBeEnabled({ timeout: 5000 })

  await signInButton.click()
}

//setup helper function
export async function setupPage(
  browser: Browser,
  state?: { cookies: any[]; origins: any[] }
) {
  const context = await browser.newContext({ storageState: state })
  const page = await context.newPage()
  return { page, context }
}
