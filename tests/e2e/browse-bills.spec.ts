import { test, expect } from "@playwright/test"
import { Console } from "console"

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/bills")
  // Wait for the list of bills to be visible
  await page.waitForSelector("ol.ais-Hits-list")

  // Check that there are list items within the list
  const bills = await page.$$("li.ais-Hits-item")
  expect(bills.length).toBeGreaterThan(0)
})
test.describe("Search result test", () => {
  test("should find bills via text search", async ({ page }) => {
    // Setup search term
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

    // Function to check the full content of a bill
    const checkFullContent = async () => {
      // Get all bill links
      const billLinks = await page.$$eval("li.ais-Hits-item a", links =>
        links
          .map(link => (link as HTMLAnchorElement).href)
          .filter(href => href !== undefined)
      )

      for (const link of billLinks) {
        await page.goto(link)
        // await page.waitForTimeout(2000)

        // Click the 'read more' button to get full content
        const readmorebtn = page.locator(".Summary__StyledButton-sc-791f19-3")
        await readmorebtn.click()
        // await page.waitForTimeout(2000)

        // Get the full content
        const fullContent = await page.textContent(
          ".Summary__FormattedBillDetails-sc-791f19-4"
        )

        // Ensure fullContent is not null
        if (fullContent) {
          // Check if the full content contains the search term
          expect(fullContent.toLowerCase()).toContain(searchTerm.toLowerCase())
        } else {
          console.warn(`Full content for link ${link} was null.`)
        }
        // Go back to the main search results page
        await page.goBack()
        // await page.waitForTimeout(2000)
      }
    }

    // Check the full content of each bill
    await checkFullContent()
  })
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

test.describe("Sort Bills test", () => {
  const sortingTests = [
    {
      option: "Sort by Relevance",
      attribute: "data-relevance-score",
      order: "desc",
      type: "number"
    }, // Assuming relevance score is a number attribute
    {
      option: "Sort by Testimony Count",
      attribute: "div.testimonyCount",
      order: "desc",
      type: "sum"
    },
    {
      option: "Sort by Cosponsor Count",
      attribute: "span.blurb",
      order: "desc",
      type: "cosponsor"
    },
    {
      option: "Sort by Next Hearing Date",
      attribute: "div.card-footer",
      order: "asc",
      type: "date"
    },
    {
      option: "Sort by Most Recent Testimony",
      attribute: "span.blurb.me-2",
      order: "desc",
      type: "courtNumber"
    }
  ]

  for (const { option, attribute, order, type } of sortingTests) {
    test(`should sort bills by ${option}`, async ({ page }) => {
      // Get the first bill content
      const initialFirstBillTextContent = await page
        .locator("li.ais-Hits-item a")
        .first()
        .textContent()

      // Interact with the sorting dropdown
      const sortDropdown = page.locator(".s__control")
      await sortDropdown.click()

      // Select the sorting option
      const sortByOption = page.locator(`div.s__option:has-text("${option}")`)
      await sortByOption.click()

      // Wait for the sorting to finish
      if (option !== "Sort by Most Recent Testimony") {
        await page.waitForFunction(initialText => {
          const firstBill = document.querySelector("li.ais-Hits-item a")
          return firstBill && firstBill.textContent !== initialText
        }, initialFirstBillTextContent)
      }

      // let nextPage = 2
      // let hasNextPage
      // do {
      //   hasNextPage = await page.$(
      //     "li.ais-Pagination-item--nextPage:not(.ais-Pagination-item--disabled)"
      //   )
      //   if (hasNextPage) {
      //     await hasNextPage.click()
      //   }
      // } while (nextPage-- > 0)

      // Verify the sorting result
      const sortedBills = page.locator("li.ais-Hits-item")
      const billValues = await sortedBills.evaluateAll(
        (
          items: Element[],
          { attribute, type }: { attribute: string; type: string }
        ) => {
          return items.map(item => {
            if (type === "cosponsor") {
              const cosponsorRecord = item.querySelectorAll(attribute)
              let cosponsorCount = 0
              cosponsorRecord.forEach(span => {
                const match = span.textContent?.match(/and (\d+) others/)
                if (match) {
                  cosponsorCount = parseInt(match[1], 10)
                }
              })
              console.log(cosponsorCount)
              return cosponsorCount
            } else if (type === "date") {
              const nextHearingDay = item.querySelector(attribute)
              const dateText = nextHearingDay?.textContent?.match(
                /\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2} (AM|PM)/
              )
              const value = dateText ? dateText[0] : ""
              const dateValue = new Date(value || "")
              console.log(dateValue.getTime())
              return dateValue.getTime()
            } else if (type === "sum") {
              const testimonyAmount = item.querySelector(attribute)
              const svgs = testimonyAmount?.querySelectorAll("svg")
              const values = Array.from(svgs || []).map(svg => {
                const textNode = svg.nextSibling
                const textContent = textNode ? textNode.textContent || "0" : "0"
                const number = parseInt(textContent, 10)
                return number
              })
              const sum = values.reduce((acc, val) => acc + val, 0)
              console.log("Text from next sibling node:", sum)

              return sum
            } else if (type === "courtNumber") {
              const courtNumber = item.querySelector(attribute)
              const value = courtNumber ? courtNumber.textContent : ""
              const numberMatch = value ? value.match(/\d+$/) : "0"
              console.log(numberMatch)
              return numberMatch ? parseInt(numberMatch[0], 10) : 0
            }
            return 0
          })
        },
        { attribute, type }
      )

      // Check if values are sorted correctly
      for (let i = 0; i < billValues.length - 1; i++) {
        if (order === "asc") {
          expect(billValues[i]).toBeLessThanOrEqual(billValues[i + 1])
        } else {
          expect(billValues[i]).toBeGreaterThanOrEqual(billValues[i + 1])
        }
      }
    })
  }
})
test.describe("Filter Bills test", () => {
  const filterCategories = [
    //"div.ais-RefinementList.mb-4:nth-of-type(1)", // General Court
    "div.ais-RefinementList.mb-4:nth-of-type(2)", // Current Committee
    "div.ais-RefinementList.mb-4:nth-of-type(3)", // City
    "div.ais-RefinementList.mb-4:nth-of-type(4)" // Primary Sponsor
    // "div.ais-RefinementList.mb-4:nth-of-type(5)" // Cosponsor
  ]

  const filterItemSelector = "li:first-child input.ais-RefinementList-checkbox"

  test("apply a first single filter from each category", async ({ page }) => {
    // Loop through each filter category and apply the first filter
    for (const filterCategory of filterCategories) {
      // Uncheck all filters first to ensure a clean state
      const checkedFilters = await page.$$(
        filterCategory + " " + filterItemSelector + ":checked"
      )
      for (const filter of checkedFilters) {
        await filter.uncheck()
      }

      // Check the first filter item in the current category
      const firstFilterItem = `${filterCategory} ${filterItemSelector}`
      const filterLabel = await page
        .locator(
          `${filterCategory} li:first-child .ais-RefinementList-labelText`
        )
        .innerText()
      await page.check(firstFilterItem)

      // Wait for the filtering to apply (adjust timeout as needed)
      await page.waitForTimeout(2000)

      // Verify the filtering result
      const filteredResults = await page.$$eval(
        ".ais-Hits-item",
        (items, filterText) => {
          return items.every(item => {
            const labels = item.querySelectorAll(".blurb")
            return Array.from(labels).some(label => {
              const labalText = label.textContent ? label.textContent : ""
              console.log(labalText, filterText)
              return labalText.includes(filterText)
            })
          })
        },
        filterLabel
      )

      expect(filteredResults).toBeTruthy() // Check that filtering worked correctly
      await page.uncheck(firstFilterItem)
    }
  })
})
