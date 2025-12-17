import { expect, type Locator, type Page } from "@playwright/test"

export class EditProfilePage {
  readonly page: Page
  readonly accessDeniedMessage: Locator
  readonly errorHeading: Locator
  readonly saveChangesButton: Locator
  readonly editProfileButton: Locator
  readonly editName: Locator
  readonly editWriteAboutSelf: Locator
  readonly editTwitterUsername: Locator
  readonly editLinkedInUrl: Locator
  readonly editSenator: Locator
  readonly editRepresentative: Locator
  readonly locateTestimony: Locator

  constructor(page: Page) {
    this.page = page
    this.accessDeniedMessage = page.getByText("This page could not be found")
    this.errorHeading = page.getByText(/404 | 403/)
    this.saveChangesButton = page.getByRole("button", {
      name: "Save Personal Information"
    })

    this.editProfileButton = page.getByRole("button", { name: "Edit Profile" })
    this.editName = page.getByLabel("Full Name", { exact: true })

    this.editWriteAboutSelf = page.getByPlaceholder(
      "Write something about yourself"
    )
    this.editTwitterUsername = page.getByPlaceholder("Twitter Username")
    this.editLinkedInUrl = page.getByPlaceholder("LinkedIn Url")
    this.editSenator = page.locator('#react-select-3-input[role="combobox"]')

    this.editRepresentative = page.locator(
      '#react-select-2-input[role="combobox"]'
    )

    this.locateTestimony = page.getByRole("tab", { name: "Testimonies" })
  }

  async goto() {
    await this.page.goto("http://localhost:3000")
  }
}
