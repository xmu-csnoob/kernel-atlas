import { test, expect } from '@playwright/test';

test.describe('Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('clicking a node updates the detail panel', async ({ page }) => {
    // First node (read-user-space) is auto-selected on load.
    // Click a different node (Storage Stack / 4th node in read flow).
    const storageNode = page.locator('button', { hasText: /Storage Stack|存储栈/ }).first();
    await storageNode.click({ force: true });

    // Detail panel should now show the Storage Stack hero label (unique to detail panel)
    await expect(
      page.locator('text=/page cache lookup|cache miss|BIO submission/').first()
    ).toBeVisible();
  });

  test('switching syscall auto-selects first node and shows detail', async ({ page }) => {
    // Click the brk() button via JS to bypass sticky-nav interception
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const brkBtn = buttons.find(b => b.textContent?.trim() === 'brk()');
      brkBtn?.click();
    });

    // Wait for brk main flow to render: look for a brk-specific node title
    await expect(page.locator('text=Heap Boundary Check').first()).toBeVisible();

    // Detail panel should show content (not the empty-state placeholder)
    await expect(page.locator('text=Select a node to view details')).not.toBeVisible();

    // The first brk node is user-space; detail panel should contain brk-specific text
    await expect(page.locator('text=/program break|heap start|Process address space/').first()).toBeVisible();
  });
});
