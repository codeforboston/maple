import { expect, type Locator, type Page } from "@playwright/test"

export class BillPage {
  readonly page: Page
  readonly firstBill: Locator
  readonly resultCount: Locator
  readonly searchBar: Locator
  readonly queryFilter: Locator
  readonly bills: Locator
  readonly searchWord: string
  readonly billPageBackToList: Locator

  constructor(page: Page) {
    this.page = page
    this.searchWord = "health"
    this.bills = page.locator("li.ais-Hits-item a")
    this.firstBill = page.locator("li.ais-Hits-item a").first()
    this.resultCount = page.getByText("Showing").first()
    this.searchBar = page.getByPlaceholder("Search For Bills")
    this.queryFilter = page.getByText("query:").locator("..")
    this.billPageBackToList = page.getByText("back to list of bills")
  }

  async goto() {
    await this.page.goto("http://localhost:3000/bills")
    await this.page.waitForSelector("li.ais-Hits-item a")
  }

  async search(query: string) {
    const initialResult = await this.firstBill.textContent()
    await this.searchBar.fill(query)
    await this.page.waitForFunction(initialResult => {
      const searchResult = document.querySelector("li.ais-Hits-item a")

      return (
        !searchResult ||
        (searchResult && searchResult.textContent != initialResult)
      )
    }, initialResult)
  }

  async sort(option: string) {
    const initialFirstBillTextContent = await this.firstBill.textContent()
    // Interact with the sorting dropdown
    await this.page.getByText("Sort by Most Recent Testimony").click()

    // Select the sorting option from the dropdown
    await this.page.getByText(`${option}`).first().click()

    // Wait for the sorting to finish
    if (option !== "Sort by Most Recent Testimony") {
      await this.page.waitForFunction(initialText => {
        const firstBill = document.querySelector("li.ais-Hits-item a")
        return firstBill && firstBill.textContent !== initialText
      }, initialFirstBillTextContent)
    }
  }

  async clickFirstBill() {
    const targetLink = await this.firstBill.evaluate(
      (link: HTMLAnchorElement) => link.href
    )
    await this.firstBill.click()

    await this.page.waitForURL(targetLink)
  }
}
