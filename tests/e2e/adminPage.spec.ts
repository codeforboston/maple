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
    // await authenticate(page)
    await page.goto("http://localhost:3000/admin")
  })
  test.afterAll(async () => {
    await browser.close() // Close the browser instance after all tests
  })

  test("should display menu icon", async () => {
    const menuIcon = page.getByTestId("MenuIcon")
    await expect(menuIcon).toBeVisible()
  })

  test("should display refresh icon", async () => {
    const refreshIcon = page.getByTestId("RefreshIcon")
    await expect(refreshIcon).toBeVisible()
  })

  test("should display viewList icon", async () => {
    const userReports = page.getByRole('menuitem', { name: 'User Reports' })
    const upgradeRequests = page.getByRole('menuitem', { name: 'Upgrade Requests' })
    await expect(userReports).toBeVisible()
    await expect(upgradeRequests).toBeVisible()
  })

  test("should display getApp icon", async () => {
    const getAppIcon = page.getByTestId("GetAppIcon")
    await expect(getAppIcon).toBeVisible()
  })


  test("should display the table in acending order", async () => {
    const reportIdHeader = await page.getByText("report id")
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
    const reportIdHeader = await page.getByText("Testimony", { exact: true })
    await reportIdHeader.click()
    const currentUrl = await page.url()
    if(!currentUrl.includes("order=DESC")) {
      await reportIdHeader.click()
    }
    const newUrl = await page.url()
    const classList = await reportIdHeader.locator("..").getAttribute('class')

    expect(newUrl).toContain("order=DESC") 
    expect(newUrl).toContain("sort=testimonyId") 
    expect(classList).toContain('Mui-active')
  })

  test("should allow adding a report", async () => {
    // Click the "SEED WITH A FAKE REPORT" button
    await page.getByRole("button", { name: "SEED WITH A FAKE REPORT" }).click()
    await expect(page.getByText("reportTestimony")).toBeVisible()
    await page.getByRole("radio", {name: "Violent"}).click()
    await await page.getByRole('button', { name: '' }).click()
  })

  test("should allow resolve a report", async () => {
    const resolvedCases = await page.getByText("resolved").count()
    await page.getByLabel("RESOLVE REPORT").first().click()
    await expect(page.getByText("User Report Content")).toBeVisible()
    await page.getByRole("radio", {name: "Remove"}).click()
    await page.locator('form').getByText('Reason:').fill('This is the reason text.')
    await page.click('button[type="submit"]')
    const currentResolvedCases = await page.getByText("resolved").count()
    expect(currentResolvedCases == resolvedCases + 1).toBeTruthy()
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




})
