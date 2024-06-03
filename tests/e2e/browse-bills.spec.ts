import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/bills")
})

test.describe("Browse Bills Page", () => {
  test("should display a list of bills", async ({ page }) => {
    // Wait for the list of bills to be visible
    await page.waitForSelector("ol.ais-Hits-list")

    // Check that there are list items within the list
    const bills = await page.$$("li.ais-Hits-item")
    expect(bills.length).toBeGreaterThan(0)
  })

  test("should find bills via text search", async ({ page }) => {
    // Wait for the search input to be available
    await page.waitForSelector('input[placeholder="Search For Bills"]')
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

  test.describe("Sorting Bills", () => {})
})
