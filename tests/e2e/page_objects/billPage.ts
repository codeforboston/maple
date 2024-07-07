import { expect, type Locator, type Page } from "@playwright/test"

export class BillPage {
  readonly page: Page
  readonly bills: Locator
  readonly resultCount: Locator
  readonly searchBar: Locator

  constructor(page: Page) {
    this.page = page
    this.bills = page.locator("li.ais-Hits-item")
    this.resultCount = page.getByText("Showing").first()
    this.searchBar = page.getByPlaceholder("Search For Bills")
  }

  async goto() {
    await this.page.goto("http://localhost:3000/bills")
    await this.page.waitForSelector("ol.ais-Hits-list")
  }

  async search(query: string) {
    const initialResultCount = await this.resultCount.textContent()
    await this.searchBar.fill(query)
    await this.page.waitForFunction(async initialResultCount => {
      const searchResultCount = await this.resultCount.textContent()
      return searchResultCount !== initialResultCount
    }, initialResultCount)
  }
}
