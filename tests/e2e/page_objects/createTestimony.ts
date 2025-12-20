// import { expect, type Locator, type Page } from "@playwright/test"

// export class CreateTestimony {
//   readonly page: Page
//   readonly toBills: Locator
//   readonly next: Locator
//   readonly writeTestimony: Locator

//   constructor(page: Page) {
//     this.page = page
//     this.toBills = page.getByRole("link", { name: "Browse Bills" }).first()
//     this.next = page.getByRole("button", { name: "Next >>" })
//     this.writeTestimony = page.getByPlaceholder("Add you testimony here")
//   }

//   async removePresetCourtfilter() {
//     const activeCourtCheckbox = this.page
//       .locator("div, span, label", { has: this.page.getByText(/Court/i) })
//       .getByRole("checkbox", { checked: true })

//     await activeCourtCheckbox.click({ noWaitAfter: true, timeout: 0 })

//     await this.page
//       .getByText("Results")
//       .first()
//       .waitFor({ state: "visible", timeout: 60000 })
//   }
// }
