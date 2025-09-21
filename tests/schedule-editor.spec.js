const { test, expect } = require('@playwright/test');

// Reusable function to authenticate without UI
async function authenticateWithAPI(page, userEmail) {
  // Go directly to our test sign-in endpoint
  await page.goto(`${process.env.NEXTAUTH_URL}/api/auth/testSignIn?email=${encodeURIComponent(userEmail)}`);
  // Wait for the redirect to the homepage to complete
  await page.waitForURL(process.env.NEXTAUTH_URL);
}

test.describe('Schedule Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Use the new API-based authentication
    await authenticateWithAPI(page, process.env.TEST_USER_EMAIL);
    
    // 4. Now navigate to create a schedule (assuming you're already logged in)
    await page.click('text=Create New Schedule');
    await page.waitForURL(/\/schedule\/\w+/);
  });
});