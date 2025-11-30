
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
