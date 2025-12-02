const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function runVerification() {
    const outputDir = path.join(__dirname, '../../docs/verification');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Starting Visual Verification...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport to a consistent size
    await page.setViewport({ width: 1280, height: 720 });

    try {
        // 1. Login and Go to Game
        console.log('Navigating to Game...');
        await page.goto('http://localhost:3004', { waitUntil: 'networkidle0' });

        // Check if we are on login or dashboard
        // If "Quick Match" button exists, click it.
        try {
            console.log('Waiting for Quick Match button...');
            await page.waitForSelector('button', { timeout: 5000 });

            const clicked = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const target = buttons.find(b => b.textContent.includes('QUICK MATCH'));
                if (target) {
                    target.click();
                    return true;
                }
                return false;
            });

            if (clicked) {
                console.log('Clicking Quick Match...');
            } else {
                console.log('Quick Match button not found by text, checking if already in game...');
            }
        } catch (e) {
            console.log('Error finding/clicking start button:', e);
        }

        // Wait for GameBoard to load
        console.log('Waiting for GameBoard...');
        try {
            await page.waitForSelector('.game-board', { timeout: 30000 });
        } catch (e) {
            console.log('Timeout waiting for .game-board. Taking error screenshot...');
            await page.screenshot({ path: path.join(outputDir, 'error_state.png') });
            throw e;
        }

        // Wait a bit for assets to render
        await new Promise(r => setTimeout(r, 2000));

        // 2. Capture Initial State
        console.log('Capturing Initial State...');
        const initialPath = path.join(outputDir, 'state_1_initial.png');
        await page.screenshot({ path: initialPath });

        // 3. Perform Action (Play Card)
        // Find a card in hand
        const cardSelector = '.hand-area .card-wrapper .card';
        await page.waitForSelector(cardSelector);

        console.log('Clicking Card...');
        await page.click(cardSelector);

        // 4. Capture Optimistic State (Immediately)
        console.log('Capturing Optimistic State...');
        const optimisticPath = path.join(outputDir, 'state_2_optimistic.png');
        await page.screenshot({ path: optimisticPath });

        // 5. Wait for Animation/Server
        await new Promise(r => setTimeout(r, 1000));

        // 6. Capture Settled State
        console.log('Capturing Settled State...');
        const settledPath = path.join(outputDir, 'state_3_settled.png');
        await page.screenshot({ path: settledPath });

        console.log('Verification Complete. Calculating Hashes...');

        const files = [initialPath, optimisticPath, settledPath];
        const hashes = {};

        files.forEach(file => {
            const buffer = fs.readFileSync(file);
            const hash = crypto.createHash('md5').update(buffer).digest('hex');
            hashes[path.basename(file)] = hash;
            console.log(`${path.basename(file)}: ${hash}`);
        });

        // Validation Logic
        if (hashes['state_1_initial.png'] !== hashes['state_2_optimistic.png']) {
            console.log('SUCCESS: Visual state changed immediately after click (Optimistic UI verified).');
        } else {
            console.error('FAILURE: No visual change detected immediately after click.');
        }

    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        await browser.close();
    }
}

runVerification();
