import { test, expect, Page, ElementHandle, Locator } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/bills")
  // Wait for the list of bills to be visible
  await page.waitForSelector("ol.ais-Hits-list")

  // Check that there are list items within the list
  const bills = await page.$$("li.ais-Hits-item")
  expect(bills.length).toBeGreaterThan(0)
})

test.describe("Search result test", () => {
  /**
   * Function to get a random word from a predefined list.
   * @returns A random word from the list.
   */
  const getSearchWord = (): string => {
    const words = [
      "health",
    ]
    return words[Math.floor(Math.random() * words.length)]
  }

  /**
   * Function to perform a search.
   * @param page - The Playwright page object.
   * @param searchTerm - The search term to use.
   */
  const performSearch = async (page: Page, searchTerm: string) => {
    await page.fill('input[placeholder="Search For Bills"]', searchTerm)
    await page.keyboard.press("Enter")
  }

/**
 * Function to wait for search results to change.
 * @param page - The Playwright page object.
 * @param initialResultCount - The initial result count to compare against.
 */
const waitForResultsToChange = async (
  page: Page,
  initialResultCount: string
) => {
  const resultCounts = await page.getByText("Showing").first().textContent()
  await expect(resultCounts).toBe(initialResultCount);
}

  /**
   * Function to get category labels text content.
   * @param page - The Playwright page object.
   * @returns An locator of search query.
   */
  const getSearchQuery = async (
    page: Page
  ): Promise<Locator> => {
    const searchQuery = await page.getByText("query:").locator("..")
    return searchQuery
  }

  /**
   * Function to check the full content of the first bill on the page.
   * @param page - The Playwright page object.
   * @param searchTerm - The search term to validate in the bill content.
   */
  const getFirstBillAddress = async (page: Page, searchTerm: string) => {
    const firstBillLink = await page.$eval(
      "li.ais-Hits-item a",
      link => (link as HTMLAnchorElement).href
    )
    return firstBillLink
  }

  test("should search for bills", async ({ page }) => {
    // Perform a search and wait for the results to change
    const searchTerm = getSearchWord()

    await performSearch(page, searchTerm)

    const initialResultCount = await page.getByText("Showing").first().textContent()

    await waitForResultsToChange(page, initialResultCount!)
  })

  test("should show search query", async ({ page }) => {
    // Perform a search and check that the category labels include the search term
    const searchTerm = getSearchWord()

    await performSearch(page, searchTerm)

    const queryFilter = await getSearchQuery(page)

    await expect(queryFilter).toContainText("query:")
    await expect(queryFilter).toContainText(searchTerm)
  })

  
  test("should click the bill and render to new page", async ({ page }) => {
    // Perform a search and check the first bill on a random page
    const searchTerm = getSearchWord()

    await performSearch(page, searchTerm)

    const initialResultCount = await page.getByText("Showing").first().textContent()

    await waitForResultsToChange(page, initialResultCount!)

    const firstBillLink = await getFirstBillAddress(page, searchTerm)

    await page.goto(firstBillLink)
    await expect(page.url()).toBe(firstBillLink)
  })


  test("should show no results found", async ({ page }) => {
    // Test to ensure the application handles no results found cases
    const searchTerm = "nonexistentsearchterm12345"

    await performSearch(page, searchTerm)

    const noResultsText = await page.getByText('Looks Pretty Empty Here')
    const noResultsImg = page.getByAltText("No Results")
    const resultCOunts = await page.getByText("Showing").first();

    await expect(noResultsText).toBeVisible();
    await expect(noResultsImg).toBeVisible();
    await expect(resultCOunts).toBeVisible();

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

/**
 * Extracts attribute values based on the type of sorting.
 * @param item - The DOM element from which to extract the value.
 * @param attribute - The attribute or selector used to locate the value.
 * @param type - The type of value to extract ('relevance', 'testimonyCount', 'cosponsorCount', 'nextHearingDate', or 'recentTestimony').
 * @returns The extracted value as a number.
 */
const getAttributeValue = async (
  item: ElementHandle<Element>,
  attribute: string,
  type: string
): Promise<number> => {
  if (type === "cosponsorCount") {
    const cosponsorCount = await item.$$eval(attribute, elements => {
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
    const dateText = await item.$eval(attribute, el => el.textContent || "")
    const match = dateText.match(
      /\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2} (AM|PM)/
    )
    const value = match ? match[0] : ""
    const dateValue = new Date(value)
    return dateValue.getTime()
  } else if (type === "testimonyCount") {
    const svgElements = await item.$$(attribute + " svg")
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
    const courtNumberText = await item.$eval(
      attribute,
      el => el.textContent || ""
    )
    const match = courtNumberText.match(/\d+$/)
    return match ? parseInt(match[0], 10) : 0
  }
  return 0
}

// Describe the test suite
test.describe("Sort Bills test", () => {
  for (const { option, attribute, order, type } of sortingTests) {
    // Test case for each sorting option
    test(`should sort bills by ${option}`, async ({ page }) => {
      // Get the initial text content of the first bill
      const initialFirstBill = page.getByRole('link', { name: /S./ }).first()
      const initialFirstBillTextContent = await initialFirstBill.textContent()
    
      // Interact with the sorting dropdown
      await page.getByText("Sort by Most Recent Testimony").click()

      // Select the sorting option from the dropdown
      await page.getByText(`${option}`).first().click()

      // Wait for the sorting to finish
      // * pending to chnage
      if (option !== "Sort by Most Recent Testimony") {
        await page.waitForFunction(initialText => {
          const firstBill = document.querySelector("li.ais-Hits-item a")
          return firstBill && firstBill.textContent !== initialText
        }, initialFirstBillTextContent)
      }

      // Verify the sorting result
      const sortedBills = await page
        .locator("li.ais-Hits-item")
        .elementHandles()
      const billValues = []
      for (const item of sortedBills) {
        const value = await getAttributeValue(
          item as ElementHandle<Element>,
          attribute,
          type
        )
        billValues.push(value)
      }

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

  // Test sorting with an empty list
  test("should handle sorting with an empty list", async ({ page }) => {
    const searchTerm = "nonexistentsearchterm12345"
    await page.fill('input[placeholder="Search For Bills"]', searchTerm)
    await page.keyboard.press("Enter")
    const sortedBills = await page.locator("li.ais-Hits-item").count()
    expect(sortedBills).toBe(0)
  })
})

interface FilterCategory {
  selector: string
}

interface CheckedFilter {
  selector: string
  labelText: string
}

/**
 * Describe and test the filtering functionality for Bills.
 */
test.describe("Filter Bills test", () => {
  // Define filter categories
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

  // Selector for the current refinement item
  const categorySelector = ".ais-CurrentRefinements-item"

  /**
   * Uncheck all filters before each test.
   * @param page - The Playwright page object.
   */
  const uncheckAllFilters = async (page: any) => {
    for (const { selector: filterCategory } of filterCategories) {
      const checkedFilters = await page.$$(
        filterCategory + " " + "input.ais-RefinementList-checkbox" + ":checked"
      )
      for (const filter of checkedFilters) {
        await filter.uncheck()
      }
    }
  }

  /**
   * Get a random filter item selector for a given filter category.
   * @param page - The Playwright page object.
   * @param filterCategory - The selector of the filter category.
   * @returns The selector for a randomly chosen filter item.
   */
  const getRandomFilterItemSelector = async (
    page: any,
    filterCategory: string
  ): Promise<string> => {
    const filterItems = await page.$$(
      `${filterCategory} li input.ais-RefinementList-checkbox`
    )
    const randomIndex = Math.floor(Math.random() * filterItems.length)
    return `li:nth-child(${randomIndex + 1}) input.ais-RefinementList-checkbox`
  }

  /**
   * Apply a filter by checking the specified filter item.
   * @param page - The Playwright page object.
   * @param filterCategory - The selector of the filter category.
   * @param filterItemSelector - The selector of the filter item to apply.
   * @returns The label text of the applied filter.
   */
  const applyFilter = async (
    page: any,
    filterCategory: string,
    filterItemSelector: string
  ): Promise<string> => {
    // Set a timeout for the page.$$
    const timeout = 2000
    const filterItem = await page.locator(
      `${filterCategory} ${filterItemSelector}`
    )
    const filterLabel = await filterItem
      .locator("..")
      .locator(".ais-RefinementList-labelText")
      .innerText()
    console.log(filterLabel)
    await filterItem.click()
    return filterLabel
  }

  // clear the filter label before each test
  test.beforeEach(async ({ page }) => {
    await uncheckAllFilters(page)
  })

  // Test: Filter Bills by Court
  test("Filter Bills by Court", async ({ page }) => {
    const filterCategory = filterCategories[0].selector
    const filterItemSelector = await getRandomFilterItemSelector(
      page,
      filterCategory
    )
    const filterLabel = await applyFilter(
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

  // Test: Filter Bills by Current Committee
  test("Filter Bills by Current Committee", async ({ page }) => {
    const filterCategory = filterCategories[1].selector
    const filterItemSelector = await getRandomFilterItemSelector(
      page,
      filterCategory
    )
    const filterLabel = await applyFilter(
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

  // Test: Filter Bills by City
  test("Filter Bills by City", async ({ page }) => {
    const filterCategory = filterCategories[2].selector
    const filterItemSelector = await getRandomFilterItemSelector(
      page,
      filterCategory
    )
    const filterLabel = await applyFilter(
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

  // Test: Filter Bills by Primary Sponsor
  test("Filter Bills by Primary Sponsor", async ({ page }) => {
    const filterCategory = filterCategories[3].selector
    const filterItemSelector = await getRandomFilterItemSelector(
      page,
      filterCategory
    )
    const filterLabel = await applyFilter(
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

  // Test: Filter Bills by Cosponsor
  test("Filter Bills by Cosponsor", async ({ page }) => {
    const filterCategory = filterCategories[4].selector
    const filterItemSelector = await getRandomFilterItemSelector(
      page,
      filterCategory
    )
    const filterLabel = await applyFilter(
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

  // Test: Combination of Filters
  test("Combination of Filters", async ({ page }) => {
    const checkedFilters: string[] = []
    for (const { selector: filterCategory } of filterCategories) {
      // Check if filter items are available for the category
      const filterItems = await page.$$(
        `${filterCategory} li input.ais-RefinementList-checkbox`
      )
      if (filterItems.length === 0) {
        console.log(
          `Skipping Combination of Filters test due to empty category: ${filterCategory}`
        )
        continue
      }
      const filterItemSelector = await getRandomFilterItemSelector(
        page,
        filterCategory
      )
      const filterLabel = await applyFilter(
        page,
        filterCategory,
        filterItemSelector
      )
      checkedFilters.push(filterLabel)
      await page.waitForTimeout(1000)
    }

    const filteredResults = await page.$$(
      `${categorySelector} .ais-CurrentRefinements-categoryLabel`
    )
    const resultsCount = filteredResults.length
    expect(resultsCount).toBeGreaterThan(0)

    for (let i = 0; i < resultsCount; i++) {
      const resultText = await filteredResults[i].innerText()
      expect(checkedFilters[i]).toContain(resultText)
    }
  })
})
