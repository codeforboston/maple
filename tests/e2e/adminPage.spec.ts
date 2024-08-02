// adminPage.spec.ts
import { test, expect } from '@playwright/test';
import { AdminPage } from './page_objects/adminPage';

test.describe('Admin Page', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    // Replace the credentials with valid admin credentials
    await page.goto('/login');
    await page.fill('#username', 'admin_username');
    await page.fill('#password', 'admin_password');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
  });

  test('should load successfully', async () => {
    await adminPage.goto();
    await adminPage.verifyPageLoaded();
  });
});
