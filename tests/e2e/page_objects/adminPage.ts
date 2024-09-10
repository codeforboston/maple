import { Page, Locator, expect } from "@playwright/test"

export class AdminPage {
  readonly page: Page
  readonly menuIcon: Locator
  readonly refreshIcon: Locator
  readonly userReports: Locator
  readonly upgradeRequests: Locator
  readonly getAppIcon: Locator
  readonly arrowDropDownIcon: Locator
  readonly navigateBeforeIcon: Locator
  readonly navigateNextIcon: Locator
  readonly reportIdHeader: Locator
  readonly testimonyHeader: Locator
  readonly fakeReportbtn: Locator

  constructor(page: Page) {
    this.page = page
    this.menuIcon = page.getByTestId("MenuIcon")
    this.refreshIcon = page.getByTestId("RefreshIcon")
    this.userReports = page.getByRole("menuitem", { name: "User Reports" })
    this.upgradeRequests = page.getByRole("menuitem", {
      name: "Upgrade Requests"
    })
    this.arrowDropDownIcon = page.getByTestId("ArrowDropDownIcon")
    this.navigateBeforeIcon = page.getByTestId("NavigateBeforeIcon")
    this.navigateNextIcon = page.getByTestId("NavigateNextIcon")
    this.getAppIcon = page.getByTestId("GetAppIcon")
    this.reportIdHeader = page.getByText("report id")
    this.testimonyHeader = page.getByText("Testimony", { exact: true })
    this.fakeReportbtn = page.getByRole("button", {
      name: "SEED WITH A FAKE REPORT"
    })
  }

  async goto() {
    await this.page.goto("http://localhost:3000/admin")
  }

  async gotoUserReportPage() {
    await this.userReports.click()
  }

  async gotoUpgradeRequests() {
    await this.upgradeRequests.click()
  }
}
