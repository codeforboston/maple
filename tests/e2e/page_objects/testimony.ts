import { expect, type Locator, type Page } from "@playwright/test"

export class TestimonyPage {
  readonly page: Page
  readonly allTab: Locator
  readonly authorFilterItem: Locator
  readonly billFilterItem: Locator
  readonly individualsTab: Locator
  readonly organizationsTab: Locator
  readonly positionFilterItem: Locator
  readonly queryFilterItem: Locator
  readonly resultsCountText: Locator
  readonly searchBar: Locator

  constructor(page: Page) {
    this.page = page
    this.allTab = page.getByRole("tab", { name: "All" })
    this.authorFilterItem = page.getByText("authorDisplayName:").locator("..")
    this.billFilterItem = page.getByText("billId:").locator("..")
    this.individualsTab = page.getByRole("tab", { name: "Individual" })
    this.organizationsTab = page.getByRole("tab", { name: "Organizations" })
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

  async filterByAuthorRoleTab(role: string) {
    await this.page.getByRole("tab", { name: role }).click()
  }

  async sort(option: string) {
    // previoud code: await this.page.getByText("Sort by New -> Old").click()
    await this.page.getByText(/Sort by/i).first().click();
    await this.page.getByRole("option", { name: option }).click()
  }

  async removePresetCourtfilter() {
    const activeCourtCheckbox = this.page 
        .locator('div, span, label', { has: this.page.getByText(/Court/i) })
        .getByRole('checkbox', { checked: true });
    
    await activeCourtCheckbox.click({ noWaitAfter: true, timeout: 0 });

    await this.resultsCountText.waitFor({ state: 'visible', timeout: 60000 });
    
  }
}
