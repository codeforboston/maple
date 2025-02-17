import { test, expect } from "@playwright/test"
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

    await expect(queryFilter).toContainText("Query:")
    await expect(queryFilter).toContainText(searchTerm)
  })

  test("should click the bill and render to new page", async ({ page }) => {
    // Perform a search and check the first bill link
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

// Array of sorting test configurations
// Need to add test for sort by relevant
const sortingTests: string[] = [
  "Sort by Testimony Count",
  "Sort by Cosponsor Count",
  "Sort by Next Hearing Date",
  "Sort by Most Recent Testimony"
]

test.describe("Sort Bills test", () => {
  for (const option of sortingTests) {
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

test.describe("Filter Bills test", () => {
  const filterCategories = [
    "div.ais-RefinementList.mb-4:nth-of-type(1)", // General Court
    "div.ais-RefinementList.mb-4:nth-of-type(2)", // Current Committee
    "div.ais-RefinementList.mb-4:nth-of-type(3)", // City
    "div.ais-RefinementList.mb-4:nth-of-type(4)", // Primary Sponsor
    "div.ais-RefinementList.mb-4:nth-of-type(5)"
    // Cosponsor
  ]

  test("should filter Bills by Court", async ({ page }) => {
    const billPage = new BillPage(page)

    const filterCategory = filterCategories[0]
    const filterItemSelector = await billPage.firstFilterItemSelector
    const filterLabel = await billPage.applyFilter(
      filterCategory,
      filterItemSelector
    )
    const encodedFilterLabel = encodeURIComponent(filterLabel).replace(
      /'/g,
      "%27"
    )
    await expect(page).toHaveURL(
      new RegExp(`court%5D%5B1%5D=${encodedFilterLabel}`)
    )
  })

  test("should filter Bills by Current Committee", async ({ page }) => {
    const billPage = new BillPage(page)

    const filterCategory = filterCategories[1]
    const filterItemSelector = await billPage.firstFilterItemSelector

    const filterLabel = await billPage.applyFilter(
      filterCategory,
      filterItemSelector
    )
    const encodedFilterLabel = encodeURIComponent(filterLabel).replace(
      /'/g,
      "%27"
    )
    await expect(page).toHaveURL(
      new RegExp(`currentCommittee%5D%5B0%5D=${encodedFilterLabel}`)
    )
  })

  test("should filter Bills by City", async ({ page }) => {
    const billPage = new BillPage(page)

    const filterCategory = filterCategories[2]
    const filterItemSelector = await billPage.firstFilterItemSelector

    const filterLabel = await billPage.applyFilter(
      filterCategory,
      filterItemSelector
    )
    const encodedFilterLabel = encodeURIComponent(filterLabel).replace(
      /'/g,
      "%27"
    )
    await expect(page).toHaveURL(
      new RegExp(`city%5D%5B0%5D=${encodedFilterLabel}`)
    )
  })

  test("should filter Bills by Primary Sponsor", async ({ page }) => {
    const billPage = new BillPage(page)
    const filterCategory = filterCategories[3]
    const filterItemSelector = await billPage.firstFilterItemSelector

    const filterLabel = await billPage.applyFilter(
      filterCategory,
      filterItemSelector
    )
    const encodedFilterLabel = encodeURIComponent(filterLabel).replace(
      /'/g,
      "%27"
    )
    await expect(page).toHaveURL(
      new RegExp(`primarySponsor%5D%5B0%5D=${encodedFilterLabel}`)
    )
  })

  test("Filter Bills by Cosponsor", async ({ page }) => {
    const billPage = new BillPage(page)

    const filterCategory = filterCategories[4]
    const filterItemSelector = await billPage.firstFilterItemSelector

    const filterLabel = await billPage.applyFilter(
      filterCategory,
      filterItemSelector
    )
    const encodedFilterLabel = encodeURIComponent(filterLabel).replace(
      /'/g,
      "%27"
    )
    await expect(page).toHaveURL(
      new RegExp(`cosponsors%5D%5B0%5D=${encodedFilterLabel}`)
    )
  })
})
