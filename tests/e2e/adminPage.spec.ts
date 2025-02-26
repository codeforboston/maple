// adminPage.spec.ts
import {
  test,
  expect,
  chromium,
  Browser,
  BrowserContext,
  Page
} from "@playwright/test"
import { AdminPage } from "./page_objects/adminPage"
require("dotenv").config()

test.describe.serial("Admin Page", () => {
  let browser: Browser
  let context: BrowserContext
  let page: Page

  test.beforeAll(async () => {
    // Create a new browser instance
    browser = await chromium.launch()
    context = await browser.newContext()
    page = await context.newPage()

    console.log({
      username: process.env.TEST_ADMIN_USERNAME,
      pw: process.env.TEST_ADMIN_PASSWORD,
      url: process.env.APP_API_URL,
      ci: process.env.ci
    })

    // Fetch the admin credentials and application URL from the environment variables
    const adminEmail = process.env.TEST_ADMIN_USERNAME
    const adminPassword = process.env.TEST_ADMIN_PASSWORD
    const url = process.env.APP_API_URL

    // Ensure admin credentials and URL are set, otherwise throw an error
    if (!adminEmail || !adminPassword) {
      throw new Error(
        "Admin credentials are not defined in the environment variables."
      )
    }

    if (!url) {
      throw new Error(
        "URL credentials are not defined in the environment variables."
      )
    }

    // Navigate to the application URL, perform login, and verify successful login
    await page.goto(url)
    await page.getByRole("button", { name: "Log in / Sign up" }).click()
    await page.getByRole("button", { name: "Sign In", exact: true }).click()
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page.getByAltText("profileMenu")).toBeVisible()

    // Navigate to the admin page
    await page.goto(url + "/admin")
  })

  test.afterAll(async () => {
    // Close the browser instance after all tests
    await browser.close()
  })

  test("should allow adding a report", async () => {
    const adminPage = new AdminPage(page)
    adminPage.gotoUserReportPage()

    await adminPage.fakeReportbtn.click()
    await expect(page.getByText("reportTestimony")).toBeVisible()
    await page.getByRole("radio", { name: "Violent" }).click()
    await page.click('button[type="submit"]')
  })

  test("should display the User Reports page", async () => {
    const adminPage = new AdminPage(page)
    await expect(adminPage.menuIcon).toBeVisible()
    await expect(adminPage.refreshIcon).toBeVisible()
    await expect(adminPage.userReports).toBeVisible()
    await expect(adminPage.upgradeRequests).toBeVisible()
    await expect(adminPage.getAppIcon).toBeVisible()
  })

  test("should display the Upgrade Requests page", async () => {
    const adminPage = new AdminPage(page)
    await adminPage.upgradeRequests.click()

    await expect(adminPage.menuIcon).toBeVisible()
    await expect(adminPage.refreshIcon).toBeVisible()
    await expect(adminPage.userReports).toBeVisible()
    await expect(adminPage.upgradeRequests).toBeVisible()
    await expect(adminPage.arrowDropDownIcon).toBeVisible()
    await expect(adminPage.navigateBeforeIcon).toBeVisible()
    await expect(adminPage.navigateNextIcon).toBeVisible()
  })

  test("should display the table in acending order", async () => {
    const adminPage = new AdminPage(page)
    adminPage.gotoUserReportPage()

    const reportIdHeader = adminPage.reportIdHeader
    await reportIdHeader.click()

    const currentUrl = await page.url()
    if (!currentUrl.includes("order=ASC")) {
      await reportIdHeader.click()
    }
    const newUrl = await page.url()
    const classList = await reportIdHeader.locator("..").getAttribute("class")

    expect(newUrl).toContain("order=ASC")
    expect(newUrl).toContain("sort=id")
    expect(classList).toContain("Mui-active")
  })

  test("should display the table in descending order", async () => {
    const adminPage = new AdminPage(page)
    adminPage.gotoUserReportPage()

    const testimonyHeader = adminPage.testimonyHeader
    await testimonyHeader.click()
    const currentUrl = await page.url()
    if (!currentUrl.includes("order=DESC")) {
      await testimonyHeader.click()
    }
    const newUrl = await page.url()
    const classList = await testimonyHeader.locator("..").getAttribute("class")

    expect(newUrl).toContain("order=DESC")
    expect(newUrl).toContain("sort=testimonyId")
    expect(classList).toContain("Mui-active")
  })

  test("should click a report and relove it if not", async () => {
    // Get the report id
    const firstRow = await page.locator("tbody tr").first()
    const firstCell = await firstRow.locator("td").first()
    const reportId = await firstCell.textContent()
    await firstCell.click()
    const currentURL = await page.url()
    expect(currentURL).toContain(reportId)

    const submitBtn = await page.getByRole("button", { name: "Submit" })
    if (await submitBtn.isEnabled()) {
      await page.getByRole("radio", { name: "Remove" }).click()
      await page.locator("form").getByText("Reason:").fill("Testing")
      await submitBtn.click()
    } else {
      await page.goBack()
    }
  })

  test("should display a table with differet categories", async () => {
    await expect(page.getByText("report id", { exact: true })).toBeVisible()
    await expect(page.getByText("Testimony", { exact: true })).toBeVisible()
    await expect(page.getByText("archived id", { exact: true })).toBeVisible()
    await expect(page.getByText("Reason", { exact: true })).toBeVisible()
    await expect(page.getByText("status", { exact: true })).toBeVisible()
    await expect(page.getByText("resolution", { exact: true })).toBeVisible()
    await expect(page.getByText("moderated by", { exact: true })).toBeVisible()
    await expect(
      page.getByText("Resolve Report", { exact: true })
    ).toBeVisible()
  })

  test("should filter the profile with pending upgrade", async () => {
    const adminPage = new AdminPage(page)
    adminPage.gotoUpgradeRequests()

    await page.getByRole("button", { name: "pendingUpgrades" }).click()
    await expect(page).toHaveURL(/.*pendingUpgrade/)
  })

  test("should filter the profile with organization", async () => {
    const adminPage = new AdminPage(page)
    adminPage.gotoUpgradeRequests()

    await page.getByRole("button", { name: "organization" }).click()
    await expect(page).toHaveURL(/.*organization/)
  })
})
