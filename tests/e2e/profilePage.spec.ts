import { test, expect, type Page, Browser, BrowserContext, chromium } from "@playwright/test"
import { ProfilePage } from "./page_objects/profilePage"
// @ts-check


test.describe.serial("Profile Page", () => {
  let browser: Browser
  let context: BrowserContext
  let page: Page

    test.beforeAll(async () => {
        


        browser = await chromium.launch()
        context = await browser.newContext()
        page = await context.newPage()

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

    // Navigate to profile and wait for it to fully load
    await page.getByRole('button', { name: 'profileMenu' }).click()
    await page.getByRole('link', { name: 'View Profile' }).click()

    // Wait for a key element that confirms the profile page has rendered
    await expect(page.getByAltText("Profile Icon")).toBeVisible({ timeout: 10000 })
    })

    test.afterAll(async () => {
        await context.close()
        await browser.close()

    })


    test.describe("Profile Page Information", () => {
        test('should display username', async () => {
            const username = page.locator("[class*='ProfileDisplayName']")
            await expect(username).toBeVisible()
        })

        test('should display user bio', async () => {
            const testBio = "Test Bio"   
            await expect(page.getByText(testBio)).toBeVisible()
        })

        test('should display legislators', async () => {   
            const representative = page.locator('div').filter({ hasText: /^Representative$/ }).first()
            const senator = page.locator('div').filter({ hasText: /^Senator$/ }).first()
            await expect(representative).toBeVisible()
            await expect(senator).toBeVisible()
        })

        test('should display testimonies', async () => {
            const testimonies = page.getByText("There are no testimonies")
            await expect(testimonies).toBeVisible()
        })
    })




    test.describe("verify banners/buttons on page", () => {

        test('should display orange banner', async () => {
            const banner = page.getByText("Currently viewing your")
            await expect(banner).toBeVisible()
        })

        test('should display edit profile button', async () => {
            const editProfileButton = page.getByRole('button', { name: "Edit Profile" })
            await expect(editProfileButton).toBeVisible()
            await editProfileButton.click()
        })

        //If user is public, a Make private button should be displayed
        test('should display Make Private button', async () => {
            //navigate to make private button          
            
            await page.getByRole('button', { name: 'settings' }).click()
            
            await expect(page.getByRole('button', { name: 'Make Private' })).toBeVisible()
            await page.getByRole('button', { name: 'Make Private' }).click()
            await expect(page.getByRole('button', { name: 'Make Public' })).toBeVisible()
            await page.getByRole('button', { name: 'Make Public' }).click()

            await page.getByRole('img', { name: 'navigation.closeNavMenu' }).click() 
        })

        test('should display edit option on testimonies', async () => {
            await page.getByRole('tab', { name: 'Testimonies' }).click()
            const testimonyCount = await page.getByTestId("view-testimony").count()    
            
            if (testimonyCount > 0) {
                await expect(page.getByRole("button", {name: /edit/i}).first()).toBeVisible()
            } else {
                test.skip()
            }
        
        })

        
    })

    



})

