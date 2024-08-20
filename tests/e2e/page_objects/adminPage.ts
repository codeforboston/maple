import { Page, Locator,  expect } from '@playwright/test';

export class AdminPage {
  readonly page: Page;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = this.page.locator('h1'); // Adjust selector to match the actual title element
  }

  async goto(){
    await this.page.goto('http://localhost:3000/admin'); // Adjust the URL if necessary
  }

}
