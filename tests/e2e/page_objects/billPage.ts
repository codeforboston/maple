import { type Locator, type Page } from "@playwright/test"

export class BillPage {
  readonly page: Page
  readonly firstBill: Locator
  readonly resultCount: Locator
  readonly searchBar: Locator
  readonly queryFilter: Locator
  readonly bills: Locator
  readonly searchWord: string
  readonly firstFilterItemSelector: string
  readonly currentCategorySelector: string
  readonly basicCategorySelector: string
  readonly billPageBackToList: Locator
  readonly resultsCountText: Locator


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
      "li:nth-child(2) input.ais-RefinementList-checkbox"
    this.currentCategorySelector = ".ais-CurrentRefinements-item"
    this.basicCategorySelector = "div.ais-RefinementList.mb-4"
    this.resultsCountText = page.getByText("Results").first()

  }

  async goto() {
    await this.page.goto("http://localhost:3000/bills")
    await this.resultCount.waitFor({ state: 'visible', timeout: 30000 });    
// await this.page.waitForSelector("li.ais-Hits-item a",{timeout:90000})
    
  }

  async search(query: string) {
    await this.searchBar.focus();
    await this.searchBar.fill(query)
    const activeQueryFilter = this.page.getByText(`Query: ${query}`).first(); 
    
    await activeQueryFilter.waitFor({ state: 'visible', timeout: 50000 });
  }

  async sort(option: string) {
    // Interact with the sorting dropdown
    await this.page.getByText("Sort by Most Recent Testimony").click()

    // Select the sorting option from the dropdown
    await this.page.getByText(`${option}`).first().click()
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

  /**
   * Uncheck all filters before each test.
   */
  async uncheckAllFilters() {
    const allCategory = this.page.locator(this.basicCategorySelector)
    const numberOfCategories = await allCategory.count()

    for (let i = 1; i <= numberOfCategories; i++) {
      const filterCategory =
        this.basicCategorySelector + ":nth-of-type(" + i + ")"

      const checkedFilters = await this.page.locator(
        filterCategory + " " + "input.ais-RefinementList-checkbox" + ":checked"
      )
      const numberOfFilters = await checkedFilters.count()
      for (let j = 0; j < numberOfFilters; j++) {
        await checkedFilters.nth(j).uncheck()
      }
    }
  }

  /**
   * Apply a filter by checking the specified filter item.
   * @param page - The Playwright page object.
   * @param filterCategory - The selector of the filter category.
   * @param filterItemSelector - The selector of the filter item to apply.
   * @returns The label text of the applied filter.
   */
  async applyFilter(
    filterCategory: string,
    filterItemSelector: string
  ): Promise<string> {
    const filterItem = await this.page.locator(
      `${filterCategory} ${filterItemSelector}`
    )
    const filterLabel = await filterItem.inputValue()
    await filterItem.click()

    return filterLabel
  }
  
  async removePresetCourtfilter() {
    const activeCourtCheckbox = this.page 
        .locator('div, span, label', { has: this.page.getByText(/Court/i) })
        .getByRole('checkbox', { checked: true });
    
    await activeCourtCheckbox.click({ noWaitAfter: true, timeout: 0 });

    await this.page.getByText("Results").first().waitFor({ state: 'visible', timeout: 60000 });
    
  }
}
