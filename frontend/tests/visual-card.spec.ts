import { test, expect } from '@playwright/test';

test.describe('Visual Component Verification', () => {
    test('Card Component renders with 3 layers', async ({ page }) => {
        // Debug logging
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

        // Go to Decks page where cards are visible (mocked in App.tsx)
        await page.goto('/decks');

        // Open the deck creator to see cards
        await page.getByRole('button', { name: 'Create New Deck' }).click();

        // Wait for cards to appear
        const card = page.locator('.card-container-3d').first();
        await expect(card).toBeVisible();

        // Check for Layer 1: Frame
        await expect(card.locator('.layer-frame')).toBeVisible();

        // Check for Layer 2: Character
        await expect(card.locator('.layer-character')).toBeVisible();
        // Verify image source contains correct path structure
        const charImg = card.locator('.character-art');
        await expect(charImg).toBeVisible();

        // Check for Layer 3: UI
        await expect(card.locator('.layer-ui')).toBeVisible();
        await expect(card.locator('.cost-badge')).toBeVisible();
        await expect(card.locator('.stat-box.atk')).toBeVisible();
        await expect(card.locator('.stat-box.hp')).toBeVisible();

        // Take a screenshot of the card for manual inspection
        await card.screenshot({ path: 'tests/screenshots/card_component_visual.png' });
    });
});
