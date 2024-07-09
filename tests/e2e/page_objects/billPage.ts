import { expect, type Locator, type Page } from "@playwright/test"

export class BillPage {
  readonly page: Page
  readonly firstBill: Locator
  readonly resultCount: Locator
  readonly searchBar: Locator
  readonly queryFilter: Locator
  readonly bills: Locator
  readonly searchWord: string
  readonly firstFilterItemSelector: string
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
    this.firstFilterItemSelector =
      "li:nth-child(1) input.ais-RefinementList-checkbox"
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

  async getAttributeValue(
    item: Locator,
    attribute: string,
    type: string
  ): Promise<number> {
    if (type === "cosponsorCount") {
      const cosponsorCount = await item
        .locator(attribute)
        .evaluateAll(elements => {
          let count = 0
          elements.forEach(el => {
            const match = el.textContent?.match(/and (\d+) others/)
            if (match) {
              count += parseInt(match[1], 10)
            }
          })
          return count
        })
      return cosponsorCount
    } else if (type === "nextHearingDate") {
      const dateText = (await item.locator(attribute).textContent()) || ""
      const match = dateText.match(
        /\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2} (AM|PM)/
      )
      const value = match ? match[0] : ""
      const dateValue = new Date(value)
      return dateValue.getTime()
    } else if (type === "testimonyCount") {
      const svgElements = await item
        .locator(attribute + " svg")
        .elementHandles()
      const values = await Promise.all(
        svgElements.map(svg =>
          svg.evaluate(node => {
            const textNode = node.nextSibling
            const textContent = textNode ? textNode.textContent || "0" : "0"
            return parseInt(textContent, 10)
          })
        )
      )
      return values.reduce((acc, val) => acc + val, 0)
    } else if (type === "recentTestimony") {
      const courtNumberText =
        (await item.locator(attribute).textContent()) || ""
      const match = courtNumberText.match(/\d+$/)
      return match ? parseInt(match[0], 10) : 0
    }
    return 0
  }
}
