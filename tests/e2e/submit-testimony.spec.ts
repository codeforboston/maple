import { test, expect } from "@playwright/test"
import { BillPage } from "./page_objects/billPage"
require("dotenv").config()

const testUserEmail = process.env.TEST_USERNAME
const testUserPassword = process.env.TEST_PASSWORD

// Ensure user credentials are set, otherwise throw an error
if (!testUserEmail || !testUserPassword) {
  throw new Error(
    "Admin credentials are not defined in the environment variables."
  )
}

// test.describe("When user is not signed in", ()=>{
//     test("should display login/signup button on a bill page", async({page})=>{

//     })
//     test("should redirect to login/signup when button is clicked", async({page})=>{

//     })
// })

test.describe("Submit Testimony Flow for logged in User", () => {
  test.beforeEach(async ({ page }) => {
    // Log in the user
    await page.goto("http://localhost:3000")
    await page.getByRole("button", { name: "Log in / Sign up" }).click()
    await page.getByRole("button", { name: "Sign In", exact: true }).click()
    await page.fill('input[name="email"]', testUserEmail) // Use test user credentials
    await page.fill('input[name="password"]', testUserPassword)
    await page
      .getByLabel("Sign In", { exact: true })
      .getByRole("button", { name: "Sign In" })
      .click()
    const profileIcon = page.getByAltText("profile icon")
    await expect(profileIcon).toBeVisible()
  })

  test("should navigate to a bill", async ({ page }) => {
    // click browse bills
    await page.getByRole("link", { name: "Browse Bills" }).first().click()

    // select the first bill in the list
    const firstBillLink = page.locator('a[href*="/bills"]').first()
    await firstBillLink.click()
  })

  test("should successfully submit testimony", async ({
    page
  }) => {
    // go to browse bills page
    await page.goto("http://localhost:3000/bills")
    await page.waitForSelector("li.ais-Hits-item a")

    // click the first bill
    const billpage = new BillPage(page)
    await billpage.clickFirstBill()

    // wait for URL change
    await page.waitForURL(/\/bills\/\d+/)
    console.log("URL changed to bill detail")
    const currentUrl = page.url()
    console.log("Current URL:", currentUrl)

    // take screenshot
    await page.screenshot({ path: "screenshot.png" })
    console.log("Screenshot taken")


    // click create testimony
    await page.getByRole("button", { name: "Create Testimony"}).click()
    await page.screenshot({ path: "screenshot.png" })

    // expect to see all stance options
    // const endorseRadioButton = page.getByLabel("Endorse")
    // const neutralRadioButton = page.getByLabel("Neutral")
    // const opposeRadioButton = page.getByLabel("Oppose")

    // can click any stance option
    // await endorseRadioButton.click({ force: true })
    // await neutralRadioButton.click()
    // await opposeRadioButton.click()

    // clicking next with oppose selected
    // const nextButton = page.getByRole("button", { name: "Next >>" })
    // await nextButton.click()
  })
})
