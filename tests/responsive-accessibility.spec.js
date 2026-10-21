import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tout refuser' }).first().click();
});

test('la page ne présente aucune violation d’accessibilité détectable automatiquement', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('aucun débordement horizontal aux tailles usuelles', async ({ page }) => {
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 }
  ]) {
    await page.setViewportSize(viewport);
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  }
});

test('le mode réduction des animations conserve le contenu visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.contact-panel')).toBeVisible();
  await expect(page.locator('.globe-static')).toBeVisible();
});

test('le fallback CSS reste visible quand les CDN sont bloqués', async ({ page }) => {
  await page.route(/https:\/\/(cdn\.jsdelivr\.net|fonts\.)/, (route) => route.abort());
  await page.reload();
  await expect(page.locator('.globe-static')).toBeVisible();
  await expect(page.locator('#atom-globe')).not.toHaveClass(/webgl-ready/);
});

test('le contenu essentiel reste disponible sans JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Construisons votre prochaine solution.' })).toBeVisible();
  await context.close();
});
