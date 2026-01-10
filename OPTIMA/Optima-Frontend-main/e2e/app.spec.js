import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('http://localhost:3000/register');

    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="username"]', 'johndoe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Optima RS')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=/Invalid credentials|failed/i')).toBeVisible();
  });
});

test.describe('Chat Functionality E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('should display channels in sidebar', async ({ page }) => {
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.channel-section')).toBeVisible();
  });

  test('should send a message in a channel', async ({ page }) => {
    // Click on a channel
    const channel = page.locator('.channel-item').first();
    await channel.click();

    // Type and send message
    await page.fill('input[placeholder*="Message"]', 'Hello, this is a test message!');
    await page.click('button[type="submit"]');

    // Verify message appears
    await expect(page.locator('text=Hello, this is a test message!')).toBeVisible();
  });

  test('should create a new channel (admin/manager only)', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create channel")');
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      await page.fill('input[placeholder*="channel"]', 'Test Channel');
      await page.fill('textarea', 'This is a test channel description');
      
      await page.click('button:has-text("Create Channel")');
      
      await expect(page.locator('text=Test Channel')).toBeVisible();
    }
  });
});

test.describe('EOD Reports E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('should navigate to EOD reports', async ({ page }) => {
    await page.click('button:has-text("EOD Reports")');
    await expect(page).toHaveURL(/.*eod/);
    await expect(page.locator('h1:has-text("EOD Reports")')).toBeVisible();
  });

  test('should submit EOD report (employee)', async ({ page }) => {
    await page.click('button:has-text("EOD Reports")');
    
    const submitButton = page.locator('button:has-text("Submit")');
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      await page.fill('input[type="date"]', '2024-01-15');
      await page.fill('input[placeholder*="completed"]', 'Completed task 1');
      await page.fill('input[placeholder*="progress"]', 'In progress task 1');
      await page.fill('input[type="number"]', '8');
      
      await page.click('button:has-text("Submit Report")');
      
      await expect(page.locator('text=/submitted|success/i')).toBeVisible();
    }
  });
});
