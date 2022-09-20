import { test } from '@playwright/test';

test.describe('Go to OM homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8585/my-data');
  });

  // test('Check Headers', async ({ page }) => {
  //   await expect(page).toHaveURL('http://localhost:8585/my-data');
  // });
});
