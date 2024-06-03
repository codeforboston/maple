import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/bills")
  // Wait for the list of bills to be visible
  await page.waitForSelector("ol.ais-Hits-list")

  // Check that there are list items within the list
  const bills = await page.$$("li.ais-Hits-item")
  expect(bills.length).toBeGreaterThan(0)
})

test.describe("Browse Bills Page", () => {
  test("should find bills via text search", async ({ page }) => {
    // Setup serach term
    const searchTerm = "act"

    // Perform the search
    await page.fill('input[placeholder="Search For Bills"]', searchTerm)
    await page.keyboard.press("Enter") // Assuming pressing Enter triggers the search

    // Get the initial result count
    const initialResultCount = await page.textContent(
      ".ResultCount__ResultContainer-sc-3931e200-0"
    )

    // Wait for the result count to change
    await page.waitForFunction(initialResultCount => {
      const currentResultCount = document.querySelector(
        ".ResultCount__ResultContainer-sc-3931e200-0"
      )?.textContent
      return currentResultCount !== initialResultCount
    }, initialResultCount)

    // Check that the search results contain the search term
    const checkResults = async () => {
      const searchResults = await page.$$eval("li.ais-Hits-item a", links =>
        links.map(link => link.textContent || "")
      )
      // Ensure every result contains the search term
      const allContainSearchTerm = searchResults.every(text =>
        text.toLowerCase().includes(searchTerm.toLowerCase())
      )
      expect(allContainSearchTerm).toBe(true)
    }
    // Check the first page of results
    await checkResults()

    // // Pagination logic
    // let hasNextPage
    // do {
    //   hasNextPage = await page.$(
    //     "li.ais-Pagination-item--nextPage:not(.ais-Pagination-item--disabled)"
    //   )
    //   if (hasNextPage) {
    //     await hasNextPage.click()
    //     // await page.waitForSelector("li.ais-Hits-item")
    //     await checkResults()
    //   }
    // } while (hasNextPage)
  })
})

test.describe("Browse Bills Page", () => {
  const sortOptions = [
    "Sort by Most Recent Testimony",
    "Sort by Relevance",
    "Sort by Testimony Count",
    "Sort by Cosponsor Count",
    "Sort by Next Hearing Date"
  ]
})
test.describe("Browse Bills Page", () => {
  const sortingTests = [
    {
      option: "Sort by Most Recent Testimony",
      attribute: "data-testimony-date",
      order: "desc",
      type: "number"
    },
    {
      option: "Sort by Relevance",
      attribute: "data-relevance-score",
      order: "desc",
      type: "number"
    }, // Assuming relevance score is a number attribute
    {
      option: "Sort by Testimony Count",
      attribute: "data-testimony-count",
      order: "desc",
      type: "number"
    },
    {
      option: "Sort by Cosponsor Count",
      attribute: "data-cosponsor-count",
      order: "desc",
      type: "number"
    },
    {
      option: "Sort by Next Hearing Date",
      attribute: "data-hearing-date",
      order: "asc",
      type: "date"
    }
  ]

  for (const { option, attribute, order, type } of sortingTests) {
    test(`should sort bills by ${option}`, async ({ page }) => {
      // Interact with the sorting dropdown
      const sortDropdown = page.locator(".s__control")
      await sortDropdown.click()

      // Select the sorting option
      const sortByOption = page.locator(`div.s__option:has-text("${option}")`)
      await sortByOption.click()
    })
  }
})
