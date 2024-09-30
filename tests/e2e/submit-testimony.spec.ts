import { test, expect } from "@playwright/test"
import { BillPage } from "./page_objects/billPage"
const testUserEmail = "testimonysubmit@gmail.com"
const testUserPassword = "maple123@"


test("is my stuff running", async ({ page }) => {
  await page.goto("http://localhost:3000")
  await page.getByRole("button", { name: "Browse All Testimony" }).click()
  await page.waitForURL(/\/testimony/)
  await expect(page).toHaveURL(/\/testimony/)
})

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
    await page.getByRole("link",{name:"Browse Bills"}).first().click()

    // select the first bill in the list
    const firstBillLink = page.locator('a[href*="/bills"]').first();
    await firstBillLink.click()

  })

  test("should successfully submit testimony when starting from the bills page",async({page})=>{
    
    // go to browse bills page
    await page.goto("http://localhost:3000/bills")
    await page.waitForSelector("li.ais-Hits-item a")

    // click the first bill
    const billpage = new BillPage(page)
    await billpage.clickFirstBill()
    await page.screenshot({ path: 'screenshot.png' });

    // click the create testimony button
    const createTestimonyButton = page.getByRole("button",{name: "Create Testimony"})
    await expect(createTestimonyButton).toBeVisible()
    await page.screenshot({ path: 'screenshot.png' });
    await createTestimonyButton.click()




  })
})
