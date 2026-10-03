import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const alpine = JSON.parse(readFileSync(new URL('../../backend/fixtures/alpine.json', import.meta.url), 'utf8'));

async function override(page: import('@playwright/test').Page, value: string, rationale = 'Synthetic regression check') {
  let count = 0;
  const handler = (dialog: import('@playwright/test').Dialog) => dialog.accept(count++ === 0 ? value : rationale);
  page.on('dialog', handler);
  await page.getByText('Gross receipts', { exact: true }).click();
  page.off('dialog', handler);
}

test('overrides recalculate decision, coverage, memo and audit', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.decision strong')).toHaveText('APPROVE');
  await page.screenshot({ path: testInfo.outputPath('desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
  await override(page, '1');
  await expect(page.locator('.decision strong')).toHaveText('DECLINE');
  await expect(page.locator('.metric').filter({ hasText: /^DSCR/ })).not.toContainText('3.135x');
  await page.getByRole('button', { name: 'memo', exact: true }).click();
  await expect(page.locator('.memo')).toContainText('Decline');
  await expect(page.locator('.memo')).not.toContainText('Approve for prototype');
  await page.getByRole('button', { name: 'audit', exact: true }).click();
  await expect(page.locator('.audit')).toContainText('Synthetic regression check');
  expect(errors).toEqual([]);
});

test('invalid overrides and blank rationales do not alter the spread', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.decision strong')).toHaveText('APPROVE');
  await override(page, 'not a number');
  await expect(page.getByRole('alert')).toContainText('finite number');
  await expect(page.locator('tbody')).toContainText('4,200,000');
  await override(page, '1', '   ');
  await expect(page.getByRole('alert')).toContainText('rationale');
  await expect(page.locator('.decision strong')).toHaveText('APPROVE');
});

test('backend failures clear the previous decision', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.decision strong')).toHaveText('APPROVE');
  await page.route('**/commercial/decision', route => route.abort());
  await override(page, '1');
  await expect(page.locator('.decision strong')).toHaveText('UNAVAILABLE');
  await page.getByRole('button', { name: 'memo', exact: true }).click();
  await expect(page.locator('.memo')).not.toContainText('Approve');
});

test('JSON upload loads data and invalid upload is reported', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type=file]').setInputFiles({ name: 'synthetic.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...alpine, borrower_name: 'Uploaded synthetic borrower' })) });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Uploaded synthetic borrower');
  await expect(page.locator('.decision strong')).toHaveText('APPROVE');
  await page.locator('input[type=file]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await expect(page.getByRole('alert')).toContainText('Invalid fixture');
});

test('UCA card displays the configured cash-flow floor from the API', async ({ page }) => {
  await page.route('**/commercial/decision', async route => {
    const response = await route.fetch();
    const body = await response.json();
    const factor = body.factors.find((item: { name: string }) => item.name === 'uca_positive');
    factor.threshold = 400000;
    factor.passed = false;
    body.outcome = 'review';
    await route.fulfill({ response, json: body });
  });
  await page.goto('/');
  await expect(page.locator('.decision strong')).toHaveText('REVIEW');
  await expect(page.locator('.metric').filter({ hasText: 'UCA cash flow' })).toContainText('Must exceed $400,000');
});

test('JSON upload preserves duplicate keys for backend rejection', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.decision strong')).toHaveText('APPROVE');
  const raw = JSON.stringify(alpine).replace('"amount":500000', '"amount":1,"amount":500000');
  expect((raw.match(/"amount":/g) ?? []).length).toBe(2);
  await page.locator('input[type=file]').setInputFiles({
    name: 'duplicate.json', mimeType: 'application/json', buffer: Buffer.from(raw),
  });
  await expect(page.getByRole('alert')).toContainText('Duplicate JSON key');
  await expect(page.locator('.decision strong')).toHaveText('UNAVAILABLE');
});
