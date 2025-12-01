import { test, expect } from '@playwright/test';

test.describe('Lobby Page E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('http://localhost:3000/login');

        // Mock API for login
        await page.route('**/api/auth/login', async route => {
            const json = { user: { id: '1', username: 'testuser' }, token: 'fake-token' };
            await route.fulfill({ json });
        });

        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await expect(page).toHaveURL('http://localhost:3000/');

        // Click Lobby link
        await page.click('text=Lobby');
        await expect(page).toHaveURL('http://localhost:3000/lobby');
    });

    test('Visual Verification', async ({ page }) => {
        await expect(page.locator('.lobby-background')).toBeVisible();
        await expect(page.locator('.lobby-logo')).toBeVisible();
        await expect(page.locator('.lobby-menu-container')).toBeVisible();

        // Check buttons
        await expect(page.locator('text=LOBBY')).toBeVisible();
        await expect(page.locator('text=DECKS')).toBeVisible();
        await expect(page.locator('text=SHOP')).toBeVisible();
        await expect(page.locator('text=PROFILE')).toBeVisible();
        await expect(page.locator('text=SETTINGS')).toBeVisible();
        await expect(page.locator('text=LOGOUT')).toBeVisible();
    });

    test('Navigation to Decks', async ({ page }) => {
        await page.click('text=DECKS');
        await expect(page).toHaveURL('http://localhost:3000/decks');
    });

    test('Logout Flow', async ({ page }) => {
        await page.click('text=LOGOUT');
        await expect(page).toHaveURL('http://localhost:3000/login');
    });
});
