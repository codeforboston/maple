// adminPage.spec.ts
import { test, expect } from '@playwright/test';
import { AdminPage } from './page_objects/adminPage';

test.describe('Admin Page', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    // Replace the credentials with valid admin credentials
    await page.goto("http://localhost:3000")
    await page.getByRole('button', { name: 'Log in / Sign up' }).nth(1).click()
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.fill('input[name="email"]', 'test');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('should load successfully', async () => {
    await adminPage.goto();
    await adminPage.verifyPageLoaded();
  });
});
