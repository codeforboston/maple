// adminPage.spec.ts
import { test, expect, chromium, Browser, BrowserContext, Page } from "@playwright/test"
import { AdminPage } from "./page_objects/adminPage"
// import { authenticate } from './auth.utils'

test.describe("Admin Page", () => {
  let browser: Browser
  let context: BrowserContext
  let page: Page

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
  })
  test.afterAll(async () => {
    await browser.close() // Close the browser instance after all tests
  })

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin")
  })

  test("should display the User Reports page", async () => {
    const adminPage = new AdminPage(page)
    await expect(adminPage.menuIcon).toBeVisible()
    await expect( adminPage.refreshIcon).toBeVisible()
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
    if(!currentUrl.includes("order=ASC")) {
      await reportIdHeader.click()
    }
    const newUrl = await page.url()
    const classList = await reportIdHeader.locator("..").getAttribute('class')

    expect(newUrl).toContain("order=ASC") 
    expect(newUrl).toContain("sort=id") 
    expect(classList).toContain('Mui-active')
  })

  test("should display the table in descending order", async () => {
    const adminPage = new AdminPage(page)
    adminPage.gotoUserReportPage()

    const testimonyHeader = adminPage.testimonyHeader
    await testimonyHeader.click()
    const currentUrl = await page.url()
    if(!currentUrl.includes("order=DESC")) {
      await testimonyHeader.click()
    }
    const newUrl = await page.url()
    const classList = await testimonyHeader.locator("..").getAttribute('class')

    expect(newUrl).toContain("order=DESC") 
    expect(newUrl).toContain("sort=testimonyId") 
    expect(classList).toContain('Mui-active')
  })

  test("should allow adding a report", async () => {
    // Create a report
    const adminPage = new AdminPage(page)
    adminPage.gotoUserReportPage()

    await adminPage.fakeReportbtn.click()
    await expect(page.getByText("reportTestimony")).toBeVisible()
    await page.getByRole("radio", {name: "Violent"}).click()
    await page.click('button[type="submit"]')
  })

  test("should reslove a report", async () => {
    // Resolve the report
    const adminPage = new AdminPage(page)
    adminPage.gotoUserReportPage()

    const pendingCases = await page.getByText("pending").count()
    const filledReason = "This is the reason text."

    if(pendingCases > 0 ){
      const resolvedCases = await page.getByText("resloves").count()
      await page.getByLabel("RESOLVE REPORT").first().click()
      await expect(page.getByText("User Report Content")).toBeVisible()
      await page.getByRole("radio", {name: "Remove"}).click()
      await page.locator('form').getByText('Reason:').fill(filledReason)
      await page.click('input[type="submit"]')
      await expect(adminPage.fakeReportbtn).toBeVisible()
      const currentResolvedCases = await page.getByText("resolved").count()
      expect(currentResolvedCases).toBeGreaterThan(resolvedCases)
    }
    
  })

  test("should display a table with differet categories", async () => {
    await expect(page.getByText("report id", { exact: true })).toBeVisible() 
    await expect(page.getByText("Testimony", { exact: true } )).toBeVisible() 
    await expect(page.getByText("archived id", { exact: true } )).toBeVisible()
    await expect(page.getByText("Reason", { exact: true } )).toBeVisible()
    await expect(page.getByText("status", { exact: true } )).toBeVisible()
    await expect(page.getByText("resolution", { exact: true } )).toBeVisible() 
    await expect(page.getByText("moderated by" , { exact: true })).toBeVisible()
    await expect(page.getByText("Resolve Report", { exact: true })).toBeVisible()
  })

  test("should filter the profile with pending upgrade", async () => {
    const adminPage = new AdminPage(page)
    adminPage.gotoUpgradeRequests()

    await page.getByRole("button", {name:"pendingUpgrades"}).click()
    await expect(page).toHaveURL(/.*pendingUpgrade/)
  })

  test("should filter the profile with organization", async () => {
    const adminPage = new AdminPage(page)
    adminPage.gotoUpgradeRequests()

    await page.getByRole("button", {name:"organization"}).click()
    await expect(page).toHaveURL(/.*organization/)
  })
  

})
