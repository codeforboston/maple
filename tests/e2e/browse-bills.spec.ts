import { test, expect, Page, ElementHandle, Locator } from "@playwright/test"
import { BillPage } from "./page_objects/billPage"


test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/bills")
  await page.waitForSelector("li.ais-Hits-item a")
})

test.describe("Search result test", () => {
  test("should search for bills", async ({ page }) => {
    const billpage = new BillPage(page)

    const searchTerm = billpage.searchWord
    const resultCount = billpage.resultCount
    const initialResultCount = await resultCount.textContent()

    await billpage.search(searchTerm)

    const searchResultCount = await resultCount.textContent()
    await expect(searchResultCount).not.toBe(initialResultCount)
  })

  test("should show search query", async ({ page }) => {
    // Perform a search and check that the category labels include the search term
    const billpage = new BillPage(page)

    const searchTerm = billpage.searchWord

    await billpage.search(searchTerm)

    const queryFilter = await billpage.queryFilter

    await expect(queryFilter).toContainText("query:")
    await expect(queryFilter).toContainText(searchTerm)
  })

  test("should click the bill and render to new page", async ({ page }) => {
    // Perform a search and check the first bill on a random page
    const billpage = new BillPage(page)

    const firstBillLink = await billpage.firstBill.evaluate(
      (link: HTMLAnchorElement) => link.href
    )
    await billpage.clickFirstBill()
    await expect(page.url()).toBe(firstBillLink)
  })

  test("should show no results found", async ({ page }) => {
    // Test to ensure the application handles no results found cases
    const searchTerm = "nonexistentsearchterm12345"
    const billpage = new BillPage(page)

    billpage.search(searchTerm)

    const noResultsText = await page.getByText("Looks Pretty Empty Here")
    const noResultsImg = page.getByAltText("No Results")
    const resultCounts = await billpage.resultCount

    await expect(noResultsText).toBeVisible()
    await expect(noResultsImg).toBeVisible()
    await expect(resultCounts).toBeVisible()
  })
})

// Define an interface for sorting test configurations
interface SortingTest {
  option: string
  attribute: string
  order: "asc" | "desc"
  type:
    | "relevance"
    | "testimonyCount"
    | "cosponsorCount"
    | "nextHearingDate"
    | "recentTestimony"
}

// Array of sorting test configurations
// Need to add test for sort by relevant
const sortingTests: SortingTest[] = [
  {
    option: "Sort by Testimony Count",
    attribute: "div.testimonyCount",
    order: "desc",
    type: "testimonyCount"
  },
  {
    option: "Sort by Cosponsor Count",
    attribute: "span.blurb",
    order: "desc",
    type: "cosponsorCount"
  },
  {
    option: "Sort by Next Hearing Date",
    attribute: "div.card-footer",
    order: "asc",
    type: "nextHearingDate"
  },
  {
    option: "Sort by Most Recent Testimony",
    attribute: "span.blurb.me-2",
    order: "asc",
    type: "recentTestimony"
  }
]

test.describe("Sort Bills test", () => {
  for (const { option, attribute, order, type } of sortingTests) {
    test(`should sort bills by ${option}`, async ({ page }) => {
      const billpage = new BillPage(page)

      await billpage.sort(option)

      const sortValue = page.getByText(option, { exact: true })

      await expect(sortValue).toBeVisible()
    })
  }

  // Test sorting with an empty list
  test("should handle sorting with an empty list", async ({ page }) => {
    const billPage = new BillPage(page)
    const searchTerm = "nonexistentsearchterm12345"
    await billPage.search(searchTerm)
    const sortedBills = await page.locator("li.ais-Hits-item").count()
    expect(sortedBills).toBe(0)
  })
})

interface FilterCategory {
  selector: string
}

test.describe("Filter Bills test", () => {
  const filterCategories: FilterCategory[] = [
    {
      selector: "div.ais-RefinementList.mb-4:nth-of-type(1)"
    }, // General Court
    {
      selector: "div.ais-RefinementList.mb-4:nth-of-type(2)"
    }, // Current Committee
    {
      selector: "div.ais-RefinementList.mb-4:nth-of-type(3)"
    }, // City
    {
      selector: "div.ais-RefinementList.mb-4:nth-of-type(4)"
    }, // Primary Sponsor
    {
      selector: "div.ais-RefinementList.mb-4:nth-of-type(5)"
    } // Cosponsor
  ]

  const categorySelector = ".ais-CurrentRefinements-item"

  test("should filter Bills by Court", async ({ page }) => {
    const billPage = new BillPage(page)

    await billPage.uncheckAllFilters()
    const filterCategory = filterCategories[0].selector
    const filterItemSelector = await billPage.firstFilterItemSelector
    const filterLabel = await billPage.applyFilter(
      page,
      filterCategory,
      filterItemSelector
    )
    const filterText = await page
      .locator(`${categorySelector} .ais-CurrentRefinements-categoryLabel`)
      .innerText()
    // Extract the number from the filter item
    let courtNumberMatch = filterLabel.match(/^\d+/)
    let courtNumber = courtNumberMatch ? courtNumberMatch[0] : ""
    expect(courtNumber).toEqual(filterText)
    await page.uncheck(`${filterCategory} ${filterItemSelector}`)
  })

  test("should filter Bills by Current Committee", async ({ page }) => {
    const billPage = new BillPage(page)

    await billPage.uncheckAllFilters()
    const filterCategory = filterCategories[1].selector
    const filterItemSelector = await billPage.firstFilterItemSelector

    const filterLabel = await billPage.applyFilter(
      page,
      filterCategory,
      filterItemSelector
    )
    const filterText = await page
      .locator(`${categorySelector} .ais-CurrentRefinements-categoryLabel`)
      .innerText()

    expect(filterLabel).toEqual(filterText)
    await page.uncheck(`${filterCategory} ${filterItemSelector}`)
  })

  test("should filter Bills by City", async ({ page }) => {
    const billPage = new BillPage(page)

    await billPage.uncheckAllFilters()
    const filterCategory = filterCategories[2].selector
    const filterItemSelector = await billPage.firstFilterItemSelector

    const filterLabel = await billPage.applyFilter(
      page,
      filterCategory,
      filterItemSelector
    )
    const filterText = await page
      .locator(`${categorySelector} .ais-CurrentRefinements-categoryLabel`)
      .innerText()
    expect(filterLabel).toEqual(filterText)
    await page.uncheck(`${filterCategory} ${filterItemSelector}`)
  })

  test("should filter Bills by Primary Sponsor", async ({ page }) => {
    const billPage = new BillPage(page)

    await billPage.uncheckAllFilters()
    const filterCategory = filterCategories[3].selector
    const filterItemSelector = await billPage.firstFilterItemSelector

    const filterLabel = await billPage.applyFilter(
      page,
      filterCategory,
      filterItemSelector
    )
    const filterText = await page
      .locator(`${categorySelector} .ais-CurrentRefinements-categoryLabel`)
      .innerText()
    expect(filterLabel).toEqual(filterText)
    await page.uncheck(`${filterCategory} ${filterItemSelector}`)
  })

  test("Filter Bills by Cosponsor", async ({ page }) => {
    const billPage = new BillPage(page)

    await billPage.uncheckAllFilters()
    const filterCategory = filterCategories[4].selector
    const filterItemSelector = await billPage.firstFilterItemSelector

    const filterLabel = await billPage.applyFilter(
      page,
      filterCategory,
      filterItemSelector
    )
    const filterText = await page
      .locator(`${categorySelector} .ais-CurrentRefinements-categoryLabel`)
      .innerText()
    expect(filterLabel).toEqual(filterText)
    await page.uncheck(`${filterCategory} ${filterItemSelector}`)
  })
})
