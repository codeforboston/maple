import { test, expect } from "@playwright/test"
const testBillPage = "http://localhost:3000/bills/193/S2097"

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
    await page.fill('input[name="email"]', "testimonysubmit@gmail.com") // Use test user credentials
    await page.fill('input[name="password"]', "maple123@")
    await page
      .getByLabel("Sign In", { exact: true })
      .getByRole("button", { name: "Sign In" })
      .click()
  })

  test("should display Create Testimony Button", async ({ page }) => {
    await page.goto(testBillPage)
    // await page.getByRole('button',{name:'Create Testimony'}).click()
    // await expect(page).toHaveURL(/.*submit-testimony/)
    const buttons = await page.$$("button")

    // Extract text content from each button
    const buttonTexts = []
    for (const button of buttons) {
      const text = await button.innerText() // Get the button's text
      buttonTexts.push(text) // Add the text to the array
    }

    // Log the button texts to the console
    console.log("Buttons on the page:", buttonTexts)
  })

  // test("should redirect to submit testimonu rl when button is selected")
})
