import { Page, Locator } from "@playwright/test"

export class ProfilePage {
  readonly page: Page
  readonly spinner: Locator
  readonly container: Locator
  readonly pendingUpgradeBanner: Locator
  readonly profileVisibilityBanner: Locator
  readonly profileHeader: Locator
  readonly verifyAccountSection: Locator
  readonly orgContactInfo: Locator
  readonly profileAboutSection: Locator
  readonly profileLegislators: Locator
  readonly viewTestimony: Locator
 


  constructor(page: Page) {
    this.page = page
    this.spinner = page.getByRole("status")
    this.container = page.locator(".container")
    this.pendingUpgradeBanner = page.getByTestId("pending-upgrade-banner")
    this.profileVisibilityBanner = page.getByTestId("profile-visibility-banner")
    this.profileHeader = page.getByTestId("profile-header")

    this.verifyAccountSection = page.getByTestId("verify-account-section")
    this.orgContactInfo = page.getByTestId("org-contact-info")
    this.profileAboutSection = page.getByTestId("profile-about-section")
    this.profileLegislators = page.getByTestId("profile-legislators")
    this.viewTestimony = page.getByTestId("view-testimony")
    
    // this.profileVisibilityBanner = page.getByText("You are viewing your profile")
    // this.publicBannerText = page.getByText("Your profile is public")
    // this.privateBannerText = page.getByText("Your profile is private")
    
    // this.pendingUpgradeBanner = page.getByRole("alert") 
    // // or
    // this.pendingUpgradeBanner = page.getByText("pending", { exact: false })
  }

  async goto(profileId: string) {
    await this.page.goto(`http://localhost:3000/profile?id=${profileId}`)
  }

  async gotoOrgPorfile(orgId: string) {
    await this.page.goto(`http://localhost:3000/profile?id=${orgId}&verifyisorg=true`)
  }

  async isPublicProfile(): Promise<boolean> {
    const banner = await this.profileVisibilityBanner.textContent()
    return banner?.includes("public") ?? false
  }

  async isPrivateProfile(): Promise<boolean> {
    const banner = await this.profileVisibilityBanner.textContent()
    return banner?.includes("private") ?? false
  }
}
