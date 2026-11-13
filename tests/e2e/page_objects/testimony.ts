import { expect, type Locator, type Page } from "@playwright/test"

export class TestimonyPage {
  readonly page: Page
  readonly allOption: Locator
  readonly authorFilterItem: Locator
  readonly billFilterItem: Locator
  readonly individualsOption: Locator
  readonly organizationsOption: Locator
  readonly positionFilterItem: Locator
  readonly queryFilterItem: Locator
  readonly resultsCountText: Locator
  readonly searchBar: Locator

  constructor(page: Page) {
    this.page = page
    // The Author Type radios in the filter panel.
    this.allOption = page.getByRole("radio", { name: "All", exact: true })
    this.authorFilterItem = page.getByText("authorDisplayName:").locator("..")
    this.billFilterItem = page.getByText("billId:").locator("..")
    this.individualsOption = page.getByRole("radio", {
      name: "Individuals",
      exact: true
    })
    this.organizationsOption = page.getByRole("radio", {
      name: "Organizations",
      exact: true
    })
    this.positionFilterItem = page.getByText("position:").locator("..")
    this.queryFilterItem = page.getByText("query:").locator("..")
    this.resultsCountText = page.getByText("Results").first()
    this.searchBar = page.getByPlaceholder("Search for Testimony")
  }

  async goto() {
    await this.page.goto("http://localhost:3000/testimony")
  }

  async search(query: string) {
    await this.searchBar.fill(query)
  }

  async filterByAuthorRole(role: string) {
    await this.page.getByRole("radio", { name: role, exact: true }).check()
  }

  selectedSort(label: string) {
    return this.page.getByText(label, { exact: true })
  }

  async sort(option: string) {
    await this.page
      .getByText(/Sort by/i)
      .first()
      .click()
    await this.page.getByRole("option", { name: option }).click()
  }

  async removePresetCourtfilter() {
    const activeCourtCheckbox = this.page
      .locator("div, span, label", { has: this.page.getByText(/Court/i) })
      .getByRole("checkbox", { checked: true })

    await activeCourtCheckbox.click({ noWaitAfter: true, timeout: 0 })

    await this.resultsCountText.waitFor({ state: "visible", timeout: 60000 })
  }
}
