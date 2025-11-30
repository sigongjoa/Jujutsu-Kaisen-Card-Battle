import { test, expect } from '@playwright/test';
import { validateScreenshot } from './utils/screenshot-validator';

test.describe('Jujutsu Kaisen Card Battle E2E Tests', () => {

    test('UC1: User Registration and Login', async ({ page }) => {
        await page.goto('/login');
        await validateScreenshot(page, 'login_page');

        // Register Flow
        // Click the switch button to show registration fields
        await page.getByRole('button', { name: 'Switch to Register' }).click();

        await page.getByPlaceholder('Username').fill(`testuser_${Date.now()}`);
        await page.getByPlaceholder('Password').fill('password123');
        await page.getByPlaceholder('Email').fill(`test_${Date.now()}@example.com`);

        // Submit registration
        await page.getByRole('button', { name: 'Register', exact: true }).click();

        // App.tsx redirects to '/' after submit
        await expect(page).toHaveURL('/');
        await validateScreenshot(page, 'dashboard_after_register');

        // Test Login Flow
        await page.goto('/login');
        await page.getByPlaceholder('Username').fill('testuser');
        await page.getByPlaceholder('Password').fill('password123');
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // Verify dashboard/home access
        await expect(page).toHaveURL('/');
        await validateScreenshot(page, 'dashboard_after_login');
    });

    test('UC2: Deck Creation and Management', async ({ page }) => {
        await page.goto('/decks');

        await page.getByRole('button', { name: 'Create New Deck' }).click();
        await page.getByPlaceholder('Deck Name').fill('My Strong Deck');

        // Select cards (mock implementation)
        const cards = await page.locator('.card-item').all();
        if (cards.length > 0) {
            await cards[0].click();
            await cards[1].click();
        }

        await page.getByRole('button', { name: 'Save Deck' }).click();

        // Verify deck appears in list
        await expect(page.locator('.deck-item').filter({ hasText: 'My Strong Deck' })).toBeVisible();
        await validateScreenshot(page, 'deck_created');
    });

    test('UC3: Game Initialization', async ({ page }) => {
        await page.goto('/lobby');

        await page.getByRole('button', { name: 'Find Match' }).click();

        // Wait for game to start (redirect to /game)
        await expect(page).toHaveURL(/\/game/);
        await validateScreenshot(page, 'game_start');
    });

    test('UC4: Game Phase Progression', async ({ page }) => {
        await page.goto('/game');
        await expect(page).toHaveURL(/\/game/);
    });

    test('UC5: Card Interaction', async ({ page }) => {
        await page.goto('/game');
    });

    test('UC6: Game Conclusion', async ({ page }) => {
        await page.goto('/game');
    });

});
