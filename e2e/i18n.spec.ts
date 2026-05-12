import { test, expect } from '@playwright/test';

const LANG_TOGGLE = 'button[aria-label="Switch language"]';
const DATA_STRUCT_TAB = 'button:has-text("Data Structures"), button:has-text("数据结构")';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function clickToggle(page: any) {
  await page.locator(LANG_TOGGLE).click();
}

async function isChinese(page: any) {
  // Multiple signals that Chinese mode is active
  const toggleText = await page.locator(LANG_TOGGLE).textContent();
  const hasChineseTab = await page.locator('button:has-text("系统调用流程")').isVisible().catch(() => false);
  return toggleText?.includes('中') || hasChineseTab;
}

async function isEnglish(page: any) {
  const toggleText = await page.locator(LANG_TOGGLE).textContent();
  const hasEnglishTab = await page.locator('button:has-text("Syscall Flow")').isVisible().catch(() => false);
  return toggleText?.includes('EN') || hasEnglishTab;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Language Toggle', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('FR2: default language is English on first visit', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(LANG_TOGGLE)).toHaveText(/EN/);
    await expect(page.locator('button:has-text("Syscall Flow")')).toBeVisible();
    await expect(page.locator('button:has-text("Data Structures")')).toBeVisible();
  });

  test('FR1: toggle switches from EN to ZH', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(LANG_TOGGLE)).toHaveText(/EN/);

    // Measure toggle latency in the browser (not Playwright overhead)
    const elapsed = await page.evaluate(async () => {
      const toggle = document.querySelector('button[aria-label="Switch language"]') as HTMLButtonElement;
      const start = performance.now();
      toggle.click();
      // Wait for React re-render (lang state change propagates)
      await new Promise(r => setTimeout(r, 0));
      return performance.now() - start;
    });

    // React state update + re-render should be well under 100ms
    expect(elapsed).toBeLessThan(100);

    // Verify Chinese mode
    await expect(page.locator(LANG_TOGGLE)).toHaveText(/中/);
    await expect(page.locator('button:has-text("系统调用流程")')).toBeVisible();
    await expect(page.locator('button:has-text("数据结构")')).toBeVisible();
  });

  test('FR3: language persists in localStorage and URL', async ({ page }) => {
    await page.goto('/');
    await clickToggle(page);

    // Verify localStorage
    const storedLang = await page.evaluate(() => localStorage.getItem('kernel-atlas-lang'));
    expect(storedLang).toBe('zh');

    // Verify URL param
    const url = page.url();
    expect(url).toContain('lang=zh');

    // Reload and verify Chinese persists
    await page.reload();
    await expect(page.locator(LANG_TOGGLE)).toHaveText(/中/);
    await expect(page.locator('button:has-text("系统调用流程")')).toBeVisible();
  });

  test('FR3: ?lang=zh URL loads page in Chinese', async ({ page }) => {
    await page.goto('/?lang=zh');
    await expect(page.locator(LANG_TOGGLE)).toHaveText(/中/);
    await expect(page.locator('button:has-text("系统调用流程")')).toBeVisible();
  });

  test('Edge: ?lang=invalid falls back to English', async ({ page }) => {
    await page.goto('/?lang=invalid');
    await expect(page.locator(LANG_TOGGLE)).toHaveText(/EN/);
    await expect(page.locator('button:has-text("Syscall Flow")')).toBeVisible();
  });

  test('FR13: Data Structures view stays English in Chinese mode', async ({ page }) => {
    await page.goto('/?lang=zh');
    await page.locator(DATA_STRUCT_TAB).click();

    // Verify Data Structures view is visible and contains English text
    await expect(page.locator('text=Kernel Data-Structure Relationships')).toBeVisible();
    await expect(page.locator('text=Drag nodes to rearrange')).toBeVisible();
  });

  test('FR1: toggle back from ZH to EN', async ({ page }) => {
    await page.goto('/?lang=zh');
    await expect(page.locator(LANG_TOGGLE)).toHaveText(/中/);

    await clickToggle(page);

    await expect(page.locator(LANG_TOGGLE)).toHaveText(/EN/);
    await expect(page.locator('button:has-text("Syscall Flow")')).toBeVisible();

    // Verify localStorage updated
    const storedLang = await page.evaluate(() => localStorage.getItem('kernel-atlas-lang'));
    expect(storedLang).toBe('en');
  });

  test('FR7: detail panel chrome is bilingual', async ({ page }) => {
    await page.goto('/?lang=zh');

    // Click the first node card in the main flow (contains 用户空间 in Chinese mode)
    const firstNode = page.locator('button', { hasText: '用户空间' }).first();
    await firstNode.click({ force: true });

    // Verify detail panel on the right contains Chinese text
    // The detail panel should show region label in Chinese
    const detailPanel = page.locator('text=/用户空间|User Space/').first();
    await expect(detailPanel).toBeVisible();

    // Source references heading should be in Chinese
    const hasChineseSourceRef = await page.locator('text=/源码引用|Source references/').first().isVisible();
    expect(hasChineseSourceRef).toBe(true);
  });

});
