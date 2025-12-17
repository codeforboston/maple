import { test, expect, Page, Locator, Browser } from "@playwright/test"
import { EditProfilePage } from "./page_objects/editProfilePage"
import { userLogin, setupPage } from "./utils/login"
import { removeSpecialChar } from "./utils/removeSpecialChar"
import { gotoStable } from "./utils/goto"

require("dotenv").config()

/**
 * @param USER_EMAIL
 * @param USER_PASSWORD
 * @returns
 */

const USER_EMAIL = process.env.TEST_USER_USERNAME
const USER_PASSWORD = process.env.TEST_USER_PASSWORD

test.describe.serial("Edit Page", () => {
  test("Prevents User A from editing User B profile", async ({ browser }) => {
    /*
    Logs in user and stores session state
    */
    const context = await browser.newContext()
    const page = await context.newPage()
    try {
      let userAStateObject: { cookies: any[]; origins: any[] } //stores current user/userA sesssion state

      await userLogin(page, USER_EMAIL, USER_PASSWORD)

      const url = "http://localhost:3000/edit-profile/about-you"
      await gotoStable(page, url)

      userAStateObject = await page.context().storageState() // save userA's session state

      /*
     Prevents user A from manipulating url to access userB's profile
    */
      const userBID = "d6ZFKTVH8i4hglyv42wz8QDaKKxw" //from test3@example.com test account on firebase
      const attackUrl = `http://localhost:3000/profile?id=${userBID}` //manipulating url with userB's id
      const attackPath = new RegExp(`.*\\/profile\\?id=${userBID}`) //manipulating path

      await gotoStable(page, attackUrl)

      await expect(page).not.toHaveURL(/.*\/edit-profile\/about-you/) //asserts that is doesn't navigate to userB's edit profile page

      await page.waitForURL(attackPath)
      await expect(page).toHaveURL(attackPath) // asserts that the manipualted URL path is the view profile page for user B

      await expect(page.getByText("404")).toBeVisible() // asserts that the page shows error messages
      await expect(page.getByText("This page could not be found")).toBeVisible()
    } finally {
      await context.close()
    }
  })

  test("Assures user can add to blank profile page", async ({ browser }) => {
    /*
    Fills blank fields with same sample data and
    confirms edits were saved. 
    */
    const { page, context } = await setupPage(browser)

    const editPage = new EditProfilePage(page)

    await userLogin(page, USER_EMAIL, USER_PASSWORD)

    const url = "http://localhost:3000/edit-profile/about-you"
    await gotoStable(page, url)

    //sample input
    const sampleName = "John Doe"
    const sampleText = "I ❤️ politics"
    const sampleTwitter = "jdoe"
    const sampleLinkedIn = "https://www.linkedIn.com/in/jdoe"
    const sampleRepresentative = "Alan Silvia"
    const sampleSenator = "Adam Gomez"

    await expect(page).toHaveURL(/.*\/edit-profile\/about-you/)

    // clear and fill with sample data
    // await expect(editPage.editName.first()).toBeVisible()
    await editPage.editName.fill(sampleName, { timeout: 50000 }) //fickle
    await editPage.editWriteAboutSelf.clear()
    await editPage.editWriteAboutSelf.fill(sampleText)
    await editPage.editTwitterUsername.clear()
    await editPage.editTwitterUsername.fill(sampleTwitter)
    await editPage.editLinkedInUrl.clear()
    await editPage.editLinkedInUrl.fill(sampleLinkedIn)
    await editPage.editRepresentative.pressSequentially(sampleRepresentative, {
      delay: 50
    })
    await page.keyboard.press("Enter")
    await editPage.editSenator.pressSequentially(sampleSenator, { delay: 50 })
    await editPage.editSenator.click()

    // save
    await page.keyboard.press("Enter")

    //assertion: Assure it saved
    //name
    await expect(page.getByText(sampleName)).toHaveText(sampleName, {
      timeout: 50000
    }) //fickle
    //(about) text
    await expect(page.getByText(sampleText, { exact: true })).toHaveText(
      sampleText
    )
    //representative
    const repRow = page.locator("div", {
      has: page.locator(".main-text", { hasText: "Representative" })
    })
    await expect(repRow.getByText(sampleRepresentative)).toHaveText(
      sampleRepresentative
    )
    //senator
    const senRow = page
      .locator(".main-text", { hasText: "Senator" })
      .locator('xpath=following-sibling::p[contains(@class,"sub-text")]')

    await removeSpecialChar(senRow, sampleSenator)

    //twitter
    const sampleTwitterNewPage = "jdoe"

    const twitterLink = page.locator('a:has(img[alt="Twitter"])')

    await expect(twitterLink).toHaveAttribute(
      "href",
      new RegExp(sampleTwitterNewPage)
    )
  })
  test("User can enable and disable notification settings", async ({
    browser
  }) => {
    const { page, context } = await setupPage(browser)
    const editPage = new EditProfilePage(page)

    await userLogin(page, USER_EMAIL, USER_PASSWORD)

    const url = "http://localhost:3000/edit-profile/about-you"
    await gotoStable(page, url)

    /**
     * @param page
     * @param saveButton The save button in notifications
     */
    const saveButton = page.getByRole("button", { name: "Save", exact: true })

    async function toggleEnabledButton(page: Page, saveButton: Locator) {
      const enableButton = page.getByRole("button", { name: "Enable" })
      const disableButton = page.getByRole("button", { name: "Enabled" })
      const settingsButton = page.getByRole("button", {
        name: "settings",
        exact: true
      })

      await expect(settingsButton).toBeEnabled()

      await settingsButton.click()

      if (await enableButton.isVisible()) {
        await enableButton.click()

        await disableButton.isVisible()

        await saveButton.click()

        //verify
        await page
          .getByRole("button", { name: "settings", exact: true })
          .click()

        await disableButton.isVisible()
      } else if (await disableButton.isVisible()) {
        await disableButton.click()

        await enableButton.isVisible()

        await saveButton.click()

        //verify

        await page
          .getByRole("button", { name: "settings", exact: true })
          .click()

        expect(enableButton).toBeVisible({ timeout: 15000 })
      } else {
        throw new Error("Unable to locate enable/d button")
      }
    }
    try {
      await toggleEnabledButton(page, saveButton)
    } finally {
      await context.close()
    }
  })

  test("User can toggle private/public settings and save them", async ({
    browser
  }) => {
    const { page, context } = await setupPage(browser)

    await userLogin(page, USER_EMAIL, USER_PASSWORD)

    const url = "http://localhost:3000/edit-profile/about-you"
    await gotoStable(page, url)

    const saveButton = page.getByRole("button", { name: "Save", exact: true })

    /**
     * @param page
     * @param saveButton The save button in notifications
     */
    async function togglePrivacyButton(page: Page, saveButton: Locator) {
      const makePublic = page.getByRole("button", { name: "Make Public" })
      const makePrivate = page.getByRole("button", { name: "Make Private" })
      const settingsButton = page.getByRole("button", {
        name: "settings",
        exact: true
      })

      await expect(settingsButton).toBeEnabled({ timeout: 10000 })

      await settingsButton.click()

      // ----default is private---

      // test button toggling
      if (await makePublic.isVisible({ timeout: 20000 })) {
        await makePublic.click()

        await makePrivate.isVisible({ timeout: 20000 })
      } else if (await makePrivate.isVisible({ timeout: 20000 })) {
        await makePrivate.click()

        await makePublic.isVisible({ timeout: 20000 })
      } else {
        throw Error(
          "Public/Private Button is not visable or toggling correctly"
        )
      }

      // Verify public/private state gets saved
      if (await makePrivate.isVisible({ timeout: 20000 })) {
        await saveButton.click()

        await page
          .getByRole("button", { name: "settings", exact: true })
          .click()

        await expect(makePrivate).toBeVisible({ timeout: 20000 })
      } else if (await makePublic.isVisible({ timeout: 20000 })) {
        await saveButton.click()

        await page
          .getByRole("button", { name: "settings", exact: true })
          .click()

        await expect(makePublic).toBeVisible({ timeout: 10000 })
      }
    }
    try {
      await togglePrivacyButton(page, saveButton)
    } finally {
      await context.close()
    }
  })
})
