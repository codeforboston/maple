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
  // Function to get a random word from a predefined list
  const getRandomWord = () => {
    const words = [
      "health",
      "education",
      "environment",
      "technology",
      "finance",
      "transportation",
      "agriculture",
      "energy",
      "housing",
      "security"
    ]
    return words[Math.floor(Math.random() * words.length)]
  }

  test("find bills via text search", async ({ page }) => {
    // Setup search term
    const searchTerm = getRandomWord()
    test.setTimeout(100000)

    // Perform the search
    await page.fill('input[placeholder="Search For Bills"]', searchTerm)
    await page.keyboard.press("Enter")

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
  })

  test("search label test", async ({ page }) => {
    // Setup search term
    const searchTerm = getRandomWord()

    // Perform the search
    await page.fill('input[placeholder="Search For Bills"]', searchTerm)
    await page.keyboard.press("Enter")

    // Check the query label
    // Wait for the elements to be visible
    const categoryLabels = page.locator(".ais-CurrentRefinements-categoryLabel")
    await categoryLabels.first().waitFor({ state: "visible" })

    // Get text content of all category labels
    const labelsTextContent = await categoryLabels.evaluateAll(labels =>
      labels.map(label => label.textContent || "")
    )

    // Log all text contents
    labelsTextContent.forEach((text, index) => {
      console.log(`Label ${index + 1}: ${text}`)
    })

    // Ensure at least one of the labels contains the search term
    const containsSearchTerm = labelsTextContent.some(textContent =>
      textContent.toLowerCase().includes(searchTerm.toLowerCase())
    )
    expect(containsSearchTerm).toBe(true)
  })

  test("check the edge case when search incldue 'act'", async ({ page }) => {
    // Setup serach term
    const searchTerm = "act"

    // Perform the search
    await page.fill('input[placeholder="Search For Bills"]', searchTerm)
    await page.keyboard.press("Enter")

    // Wait for the result
    await page.waitForTimeout(1000)

    // Check that the search results contain 'act'
    const searchResults = await page.$$eval("li.ais-Hits-item a", links =>
      links.map(link => link.textContent || "")
    )
    // Ensure every result contains the search term
    const allContainSearchTerm = searchResults.every(text =>
      text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    expect(allContainSearchTerm).toBe(true)
  })

  test("check the first bill on random page", async ({ page }) => {
    // Setup search term
    const searchTerm = getRandomWord()
    test.setTimeout(100000)

    // Perform the search
    await page.fill('input[placeholder="Search For Bills"]', searchTerm)
    await page.keyboard.press("Enter")

    // Wait for the result
    await page.waitForTimeout(1000)

    // Function to check the full content of the first bill on the page
    const checkFirstBill = async () => {
      const firstBillLink = await page.$eval(
        "li.ais-Hits-item a",
        link => (link as HTMLAnchorElement).href
      )

      await page.goto(firstBillLink)

      // Click the 'read more' button to get full content
      const readmorebtn = page.locator(".Summary__StyledButton-sc-791f19-3")
      await readmorebtn.click()

      // Get the full content
      const fullContent = await page.textContent(
        ".Summary__FormattedBillDetails-sc-791f19-4"
      )

      // Ensure fullContent is not null
      if (fullContent) {
        // Check if the full content contains the search term
        expect(fullContent.toLowerCase()).toContain(searchTerm.toLowerCase())
      } else {
        console.warn(`Full content for first bill on page was null.`)
      }

      // Go back to the main search results page
      await page.goBack()

      // Wait for the result
      await page.waitForTimeout(1000)
    }

    // Function to click a random number of times on the "next page" button
    const clickNextPageRandomTimes = async () => {
      const randomClicks = Math.floor(Math.random() * 5) + 1 // Random number between 1 and 5
      for (let i = 0; i < randomClicks; i++) {
        const hasNextPage = await page.$(
          "li.ais-Pagination-item--nextPage:not(.ais-Pagination-item--disabled)"
        )
        if (hasNextPage) {
          await hasNextPage.click()
          await page.waitForTimeout(1000)
        } else {
          break
        }
      }
    }

    // Check the first bill on random page for five times if available
    let times = 5
    do {
      await checkFirstBill()
      await clickNextPageRandomTimes()
      times--
    } while (times > 0)
  })
})

test.describe("Sort Bills test", () => {
  const sortingTests = [
    {
      option: "Sort by Relevance",
      attribute: "data-relevance-score",
      order: "desc",
      type: "number"
    },
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

      // Verify the sorting result
      const sortedBills = page.locator("li.ais-Hits-item")
      const billValues = await sortedBills.evaluateAll(
        (
          items: Element[],
          { attribute, type }: { attribute: string; type: string }
        ) => {
          return items.map(item => {
            // Handle different types of data extraction based on 'type'
            if (type === "cosponsor") {
              const cosponsorRecord = item.querySelectorAll(attribute)
              let cosponsorCount = 0
              // Match pattern 'and (number) others'
              cosponsorRecord.forEach(span => {
                const match = span.textContent?.match(/and (\d+) others/)
                if (match) {
                  cosponsorCount = parseInt(match[1], 10)
                }
              })
              return cosponsorCount
            } else if (type === "date") {
              // Extract date and convert to timestamp
              const nextHearingDay = item.querySelector(attribute)
              const dateText = nextHearingDay?.textContent?.match(
                /\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2} (AM|PM)/
              )
              const value = dateText ? dateText[0] : ""
              const dateValue = new Date(value || "")
              return dateValue.getTime()
            } else if (type === "sum") {
              // Sum up numbers found in 'svg' elements(te) - Total Testimonies
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
              // Extract court number
              const courtNumber = item.querySelector(attribute)
              const value = courtNumber ? courtNumber.textContent : ""
              const numberMatch = value ? value.match(/\d+$/) : "0"
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
    {
      selector: "div.ais-RefinementList.mb-4:nth-of-type(1)",
      usingNum: true
    }, // General Court
    {
      selector: "div.ais-RefinementList.mb-4:nth-of-type(2)",
      usingNum: false
    }, // Current Committee
    {
      selector: "div.ais-RefinementList.mb-4:nth-of-type(3)",
      usingNum: false
    }, // City
    {
      selector: "div.ais-RefinementList.mb-4:nth-of-type(4)",
      usingNum: false
    } // Primary Sponsor
  ]

  const filterItemSelector = "li:first-child input.ais-RefinementList-checkbox"

  test("apply a first single filter from General Court, Current Committee, City, and Primary Sponsor", async ({
    page
  }) => {
    // Loop through each filter category and apply the first filter
    for (const { selector: filterCategory, usingNum } of filterCategories) {
      // Uncheck all filters first to ensure a clean state
      const checkedFilters = await page.$$(
        filterCategory + " " + filterItemSelector + ":checked"
      )
      for (const filter of checkedFilters) {
        await filter.uncheck()
      }

      // Check the first filter item in the current category
      const firstFilterItem = `${filterCategory} ${filterItemSelector}`
      let filterLabel = await page
        .locator(
          `${filterCategory} li:first-child .ais-RefinementList-labelText`
        )
        .innerText()
      await page.check(firstFilterItem)

      // Wait for the filtering to apply
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
