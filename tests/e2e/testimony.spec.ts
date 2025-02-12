import { test, expect } from "@playwright/test"
import { TestimonyPage } from "./page_objects/testimony"

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/testimony")
})

test.describe("Browse Testimonies Page", () => {
  test("should display header and tabs", async ({ page }) => {
    const header = page.getByRole("heading", { name: "Browse Testimony" })
    await expect(header).toBeVisible()
  })

  test("should navigate to details page", async ({ page }) => {
    const links = page.getByRole("link")

    // only tests the first url with /testimony/ in the url
    for (let i = 0; i < (await links.count()); i++) {
      const link = links.nth(i)
      const href = await link.getAttribute("href")
      if (href?.includes("/testimony/")) {
        await link.click()
        await expect(page).toHaveURL(new RegExp(`.*${href}`))
        return
      }
    }
  })
})

test.describe("Testimony Search", () => {
  test("should search for testimonies", async ({ page }) => {
    const testimonyPage = new TestimonyPage(page)
    const queryText = "test"
    await testimonyPage.search(queryText)

    const { queryFilterItem, resultsCountText } = testimonyPage
    await expect(queryFilterItem).toContainText("Query:")
    await expect(queryFilterItem).toContainText(queryText)
    await expect(resultsCountText).toBeVisible()
  })

  test("should show zero results if no testimonies found", async ({ page }) => {
    const testimonyPage = new TestimonyPage(page)
    const queryText = "cantfindthis!"
    await testimonyPage.search(queryText)

    const { resultsCountText } = testimonyPage
    const noResultsImg = page.getByAltText("No Results")
    await expect(resultsCountText).toBeVisible()
    await expect(noResultsImg).toBeVisible()
  })
})

test.describe("Testimony Filtering", () => {
  test("should filter for testimonies by author role, individuals", async ({
    page
  }) => {
    const testimonyPage = new TestimonyPage(page)
    await testimonyPage.filterByAuthorRoleTab("Individuals")

    const { individualsTab } = testimonyPage
    await expect(page).toHaveURL(/.*authorRole%5D%5B0%5D=user/)
    await expect(individualsTab).toHaveClass(/nav-link/)
    await expect(individualsTab).toHaveClass(/active/)
  })

  test("should filter for testimonies by author role, organizations", async ({
    page
  }) => {
    const testimonyPage = new TestimonyPage(page)
    await testimonyPage.filterByAuthorRoleTab("Organizations")

    const { organizationsTab } = testimonyPage
    await expect(page).toHaveURL(/.*authorRole%5D%5B0%5D=organization/)
    await expect(organizationsTab).toHaveClass(/nav-link/)
    await expect(organizationsTab).toHaveClass(/active/)
  })

  /* "All" is the page default, this test switches tabs then goes back to "All"
    SKIP: This test will fail, switching from other tabs back to "All" currently has a bug
    https://github.com/codeforboston/maple/issues/1578 */
  test.skip("should filter for testimonies by all", async ({ page }) => {
    const testimonyPage = new TestimonyPage(page)
    await testimonyPage.filterByAuthorRoleTab("Individuals")

    const { individualsTab, allTab } = testimonyPage
    await expect(page).toHaveURL(/.*authorRole%5D%5B0%5D=user/)
    await expect(individualsTab).toHaveClass(/nav-link/)
    await expect(individualsTab).toHaveClass(/active/)

    await testimonyPage.filterByAuthorRoleTab("All")
    await expect(page).toHaveURL(/.*authorRole%5D%5B0%5D=all/)
    await expect(allTab).toHaveClass(/nav-link/)
    await expect(allTab).toHaveClass(/active/)
  })

  test("should filter by court", async ({ page }) => {
    await page.getByRole("checkbox", { name: "192" }).check()
    const appliedCourtFilters = page.getByText("court:").locator("..")
    await expect(appliedCourtFilters).toContainText("192")
    await expect(page).toHaveURL(/.*court%5D%5B1%5D=192/)
  })

  test("should filter by position: endorse", async ({ page }) => {
    await page.getByRole("checkbox", { name: "endorse" }).check()
    const testimonyPage = new TestimonyPage(page)
    await expect(testimonyPage.positionFilterItem).toContainText("endorse")
    await expect(page).toHaveURL(/.*position%5D%5B0%5D=endorse/)
  })

  test("should filter by position: neutral", async ({ page }) => {
    await page.getByRole("checkbox", { name: "neutral" }).check()
    const testimonyPage = new TestimonyPage(page)
    await expect(testimonyPage.positionFilterItem).toContainText("neutral")
    await expect(page).toHaveURL(/.*position%5D%5B0%5D=neutral/)
  })

  test("should filter by bill", async ({ page }) => {
    const billCheckbox = page.getByLabel(/^[S|H]\d{1,4}$/).first()
    const billId = await billCheckbox.inputValue()
    expect(billId).toBeTruthy()

    if (billId) {
      await billCheckbox.check()
      const testimonyPage = new TestimonyPage(page)
      await expect(testimonyPage.billFilterItem).toContainText(billId as string)
      await expect(page).toHaveURL(new RegExp(`.*billId%5D%5B0%5D=${billId}`))
    }
  })

  test("should filter by author", async ({ page }) => {
    const authorName = await page.getByTestId("author").first().textContent()
    expect(authorName).toBeTruthy()

    if (authorName) {
      await page.getByRole("checkbox", { name: authorName }).check()
      const testimonyPage = new TestimonyPage(page)
      await expect(testimonyPage.authorFilterItem).toContainText(authorName)
      const encodedAuthorName = encodeURIComponent(authorName).replace(
        "'",
        "%27"
      )
      await expect(page).toHaveURL(
        new RegExp(`.*authorDisplayName%5D%5B0%5D=${encodedAuthorName}`)
      )
    }
  })
})

test.describe("Testimony Sorting", () => {
  test("should sort by new -> old", async ({ page }) => {
    const testimonyPage = new TestimonyPage(page)
    await testimonyPage.sort("Sort by New -> Old")
    const sortValue = page.getByText("Sort by New -> Old", { exact: true })
    await expect(sortValue).toBeVisible()
  })

  test("should sort by old -> new", async ({ page }) => {
    const testimonyPage = new TestimonyPage(page)
    await testimonyPage.sort("Sort by Old -> New")
    const sortValue = page.getByText("Sort by Old -> New", { exact: true })
    await expect(sortValue).toBeVisible()
  })
})
