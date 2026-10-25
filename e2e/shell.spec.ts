import { expect, test } from '@playwright/test'

test('loads app shell navigation', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1, name: 'Solo System' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Trackers' })).toBeVisible()
})
