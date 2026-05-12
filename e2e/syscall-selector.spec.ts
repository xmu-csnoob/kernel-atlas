import { test, expect } from '@playwright/test';

test.describe('Syscall Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('has 12 syscall entries', async ({ page }) => {
    const buttons = page.locator('button', {
      has: page.locator('text=/^\\w+\\(\\)$/'),
    });
    // The SyscallSelector renders buttons for each syscall name ending in ()
    const allButtons = page.locator('button');
    const syscallButtons = allButtons.filter({ hasText: /\(\)$/ });
    await expect(syscallButtons).toHaveCount(12);
  });

  test('includes all expected syscalls', async ({ page }) => {
    const expected = [
      'read()',
      'fork()',
      'write()',
      'open()',
      'mmap()',
      'execve()',
      'socket()',
      'ioctl()',
      'clone()',
      'epoll_wait()',
      'exit()',
      'brk()',
    ];
    for (const name of expected) {
      await expect(page.locator('button', { hasText: name })).toBeVisible();
    }
  });

  test('switching syscall loads correct main flow', async ({ page }) => {
    // Click brk() — force because sticky nav can intercept at some viewport sizes
    await page.locator('button', { hasText: 'brk()' }).first().click({ force: true });
    // The main flow should render nodes with brk-specific titles
    await expect(page.locator('text=brk').first()).toBeVisible();

    // Click socket()
    await page.locator('button', { hasText: 'socket()' }).first().click({ force: true });
    await expect(page.locator('text=socket').first()).toBeVisible();
  });
});
