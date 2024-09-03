// adminPage.spec.ts
import { test, expect, chromium, Browser } from "@playwright/test"
import { AdminPage } from "./page_objects/adminPage"
// import { authenticate } from './auth.utils'

test.describe("Admin Page", () => {
  let browser: Browser
  let context
  let page

  test.beforeAll(async () => {
    // Create a new browser instance
    browser = await chromium.launch()
    context = await browser.newContext() // Create a new context for all tests
    page = await context.newPage()
    // Replace the credentials with valid admin credentials
    await page.goto("http://localhost:3000")
    await page.getByRole("button", { name: "Log in / Sign up" }).click()
    await page.getByRole("button", { name: "Sign In", exact: true }).click()
    await page.fill('input[name="email"]', "testadmin@example.com")
    await page.fill('input[name="password"]', "password")
    await page.click('button[type="submit"]')
    await expect(page.getByAltText("profile icon")).toBeVisible()
    // await authenticate(page)
    await page.goto("http://localhost:3000/admin")
  })
  test.afterAll(async () => {
    await browser.close() // Close the browser instance after all tests
  })

  test("should display menu icon", async ({ page }) => {
    const menuIcon = page.getByTestId("MenuIcon")
    await expect(menuIcon).toBeVisible()
  })

  test("should display refresh icon", async ({ page }) => {
    const refreshIcon = page.getByTestId("RefreshIcon")
    await expect(refreshIcon).toBeVisible()
  })

  test("should display viewList icon", async ({ page }) => {
    const viewListIcon = page.getByTestId("ViewListIcon")
    await expect(viewListIcon).toBeVisible()
  })

  test("should display getApp icon", async ({ page }) => {
    const getAppIcon = page.getByTestId("GetAppIcon")
    await expect(getAppIcon).toBeVisible()
  })

  test("should allow adding a report and display it in the table", async ({
    page
  }) => {
    // Click the "SEED WITH A FAKE REPORT" button
    await page.getByRole("button", { name: "SEED WITH A FAKE REPORT" }).click()
    await page.getByText("reportTestimony")
    await page.getByText("Violent").click()
    await page.click('button[type="submit"]')
    // Verify that the report appears in the table
    const reportRow = page.getByRole("row", { name: "reprot id" })
    console.log(reportRow.count())
    // Check that the specific cells contain the expected content
    await expect(page.getByRole("row", { name: "reprot id" })).toBeVisible() // Report ID column
    await expect(page.getByRole("row", { name: "Testimony" })).toBeVisible() // Testimony column
    await expect(page.getByRole("row", { name: "archived id" })).toBeVisible() // Reason column
    await expect(page.getByRole("row", { name: "Reason" })).toBeVisible() // Status column
    await expect(page.getByRole("row", { name: "status" })).toBeVisible() // Report ID column
    await expect(page.getByRole("row", { name: "resolution" })).toBeVisible() // Testimony column
    await expect(page.getByRole("row", { name: "moderated by" })).toBeVisible() // Reason column
    await expect(
      page.getByRole("row", { name: "Resolve Report" })
    ).toBeVisible()
    // Optionally, interact with the "RESOLVE REPORT" button
    await expect(
      reportRow.getByRole("button", { name: "RESOLVE REPORT" })
    ).toBeVisible()
  })
})
