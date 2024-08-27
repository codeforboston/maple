// adminPage.spec.ts
import { test, expect } from "@playwright/test"
import { AdminPage } from "./page_objects/adminPage"

test.describe("Admin Page", () => {
  let adminPage: AdminPage

  test.beforeEach(async ({ page }) => {
    // adminPage = new AdminPage(page)
    // // Replace the credentials with valid admin credentials
    // await page.goto("http://localhost:3000")
    // await page.getByRole("button", { name: "Log in / Sign up" }).click()
    // await page.getByRole("button", { name: "Sign In", exact: true }).click()
    // await page.fill('input[name="email"]', "testadmin@example.com")
    // await page.fill('input[name="password"]', "password")
    // await page.click('button[type="submit"]')
    // await page.waitForTimeout(10)
   
  })

  test('should display "No User Reports yet." when there are no reports', async ({
    page
  }) => {
    
    await page.goto("http://localhost:3000")
    await page.waitForTimeout(10)
    await page.goto("http://localhost:3000/admin")
    await expect(page.getByText("No User Reports yet.")).toBeVisible()
  })

  test("should allow adding a report and display it in the table", async ({
    page
  }) => {
    // Click the "SEED WITH A FAKE REPORT" button
    await page.getByRole("button", { name: "SEED WITH A FAKE REPORT" }).click()
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
