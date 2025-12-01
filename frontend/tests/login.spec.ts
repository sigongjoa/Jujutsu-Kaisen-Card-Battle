import { test, expect } from '@playwright/test';

test.describe('Login Page E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Assuming the app is running on localhost:3000
        await page.goto('http://localhost:3000/login');
    });

    test('Visual Layer Verification', async ({ page }) => {
        // Check for the 4 layers
        await expect(page.locator('.layer-background')).toBeVisible();
        await expect(page.locator('.layer-modal-frame')).toBeVisible();
        await expect(page.locator('.layer-interactive')).toBeVisible();
        await expect(page.locator('.layer-vfx')).toBeVisible();

        // Check for VFX elements
        await expect(page.locator('.aura-effect')).toBeVisible();
        await expect(page.locator('.fog-layer')).toBeVisible();
    });

    test('Login Flow', async ({ page }) => {
        // Mock API
        await page.route('**/api/auth/login', async route => {
            const json = { user: { id: '1', username: 'testuser' }, token: 'fake-token' };
            await route.fulfill({ json });
        });

        // Fill form
        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', 'password123');

        // Click Login
        await page.click('button[type="submit"]');

        // Verify redirect to dashboard (/)
        // Note: The app might redirect to / if login is successful.
        // We wait for URL to change.
        await expect(page).toHaveURL('http://localhost:3000/');
    });

    test('Register Toggle Flow', async ({ page }) => {
        // Click Create Account
        await page.click('text=Create Account');

        // Check for Email input
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toHaveText('REGISTER');

        // Switch back
        await page.click('text=Back to Login');
        await expect(page.locator('input[name="email"]')).not.toBeVisible();
        await expect(page.locator('button[type="submit"]')).toHaveText('LOGIN');
    });
});
