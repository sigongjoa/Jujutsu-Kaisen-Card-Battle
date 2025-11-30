import CryptoJS from 'crypto-js';
import { Page, expect } from '@playwright/test';

export async function validateScreenshot(page: Page, name: string, expectedHash?: string) {
    const screenshot = await page.screenshot({ path: `tests/screenshots/${name}.png` });
    const wordArray = CryptoJS.lib.WordArray.create(screenshot);
    const hash = CryptoJS.MD5(wordArray).toString();

    console.log(`Screenshot: ${name}, Hash: ${hash}`);

    if (expectedHash) {
        expect(hash).toBe(expectedHash);
    }

    return hash;
}
