import { expect, type Locator, type Page } from "@playwright/test"

export class BillPage {
  readonly page: Page
  readonly bills: Locator
  readonly resultCount: Locator
  readonly searchBar: Locator
  readonly queryFilter: Locator
  readonly searchWord: string

  constructor(page: Page) {
    this.page = page
    this.searchWord = "health"
    this.bills = page.getByRole("link", { name: /S./ }).first()
    this.resultCount = page.getByText("Showing").first()
    this.searchBar = page.getByPlaceholder("Search For Bills")
    this.queryFilter = page.getByText("query:").locator("..")
  }

  async goto() {
    await this.page.goto("http://localhost:3000/bills")
    await this.page.waitForSelector("li.ais-Hits-item a")
  }

  async search(query: string) {
    const initialResult = await this.bills.textContent()
    console.log(initialResult)
    await this.searchBar.fill(query)
    await this.page.waitForFunction(initialResult => {
      const searchResult = document.querySelector("li.ais-Hits-item a")
      console.log(searchResult && searchResult.textContent)
      return searchResult && searchResult.textContent != initialResult
    }, initialResult)
  }
}
