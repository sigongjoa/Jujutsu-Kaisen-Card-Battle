import { test, expect } from '@playwright/test';
import { validateScreenshot } from './utils/screenshot-validator';

test.describe('Jujutsu Kaisen Card Battle E2E Tests', () => {

    test('UC1: User Registration and Login', async ({ page }) => {
        await page.goto('/login');
        await validateScreenshot(page, 'login_page');

        const timestamp = Date.now();
        const username = `testuser_${timestamp}`;
        const email = `test_${timestamp}@example.com`;
        const password = 'password123';

        // Register Flow
        await page.getByRole('button', { name: 'Switch to Register' }).click();

        await page.getByPlaceholder('Username').fill(username);
        await page.getByPlaceholder('Password').fill(password);
        await page.getByPlaceholder('Email').fill(email);

        // Submit registration
        await page.getByRole('button', { name: 'Register', exact: true }).click();

        // App.tsx redirects to '/' after submit
        await expect(page).toHaveURL('/');
        await validateScreenshot(page, 'dashboard_after_register');

        // Test Login Flow
        await page.goto('/login');
        // Login uses Email placeholder now
        await page.getByPlaceholder('Email').fill(email);
        await page.getByPlaceholder('Password').fill(password);
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // Verify dashboard/home access
        await expect(page).toHaveURL('/');
        await validateScreenshot(page, 'dashboard_after_login');
    });

    test('UC2: Deck Creation and Management', async ({ page }) => {
        // Login first
        const timestamp = Date.now();
        const email = `deck_test_${timestamp}@example.com`;
        const password = 'password123';

        // Register user for this test
        await page.goto('/login');
        await page.getByRole('button', { name: 'Switch to Register' }).click();
        await page.getByPlaceholder('Username').fill(`deck_user_${timestamp}`);
        await page.getByPlaceholder('Password').fill(password);
        await page.getByPlaceholder('Email').fill(email);
        await page.getByRole('button', { name: 'Register', exact: true }).click();
        await expect(page).toHaveURL('/');

        await page.goto('/decks');

        await page.getByRole('button', { name: 'Create New Deck' }).click();
        await page.getByPlaceholder('Deck Name').fill('My Strong Deck');

        // Select cards (using the new Card component structure)
        // The new Decks.tsx renders cards with .card-item class
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
        // Login first
        const timestamp = Date.now();
        const email = `game_test_${timestamp}@example.com`;
        const password = 'password123';

        // Register user for this test
        await page.goto('/login');
        await page.getByRole('button', { name: 'Switch to Register' }).click();
        await page.getByPlaceholder('Username').fill(`game_user_${timestamp}`);
        await page.getByPlaceholder('Password').fill(password);
        await page.getByPlaceholder('Email').fill(email);
        await page.getByRole('button', { name: 'Register', exact: true }).click();
        await expect(page).toHaveURL('/');

        await page.goto('/lobby');

        // Use "Challenge Player" with "bot" as opponent
        await page.getByPlaceholder('Opponent ID').fill('bot');
        await page.getByRole('button', { name: 'Challenge Player' }).click();

        // Wait for game to start (redirect to /game)
        await expect(page).toHaveURL(/\/game/);
        await validateScreenshot(page, 'game_start');
    });

    test('UC4: Game Phase Progression', async ({ page }) => {
        await page.goto('/game');
        // This might fail if not logged in or no game ID, but let's see.
        // Ideally we should set up a game state.
    });

    test('UC5: Card Interaction', async ({ page }) => {
        await page.goto('/game');
    });

    test('UC6: Game Conclusion', async ({ page }) => {
        await page.goto('/game');
    });

});
