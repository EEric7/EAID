import { expect, test } from '@playwright/test';

const consentCookie = 'eai_cookie_consent';

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test('affiche la bannière sans consentement puis enregistre un refus', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('#cookie-banner');
  await expect(banner).toBeVisible();
  await page.getByRole('button', { name: 'Tout refuser' }).first().click();
  await expect(banner).toBeHidden();

  const cookie = (await page.context().cookies()).find(({ name }) => name === consentCookie);
  expect(cookie).toBeDefined();
  expect(cookie.sameSite).toBe('Lax');
  const value = JSON.parse(decodeURIComponent(cookie.value));
  expect(value).toMatchObject({ version: 1, necessary: true, preferences: false, analytics: false });
});

test('accepte toutes les catégories et émet le changement de consentement', async ({ page }) => {
  await page.addInitScript(() => {
    window.consentEvents = [];
    window.addEventListener('cookieconsentchange', ({ detail }) => window.consentEvents.push(detail));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Tout accepter' }).click();
  await expect.poll(() => page.evaluate(() => window.consentEvents.at(-1))).toMatchObject({
    necessary: true,
    preferences: true,
    analytics: true
  });
});

test('permet une sélection personnalisée et sa réouverture', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Personnaliser' }).click();
  const dialog = page.locator('#cookie-dialog');
  await expect(dialog).toBeVisible();
  await page.locator('#cookie-preferences').check();
  await page.getByRole('button', { name: 'Enregistrer mes choix' }).click();
  await expect(dialog).toBeHidden();

  await page.locator('#cookie-manage').click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#cookie-preferences')).toBeChecked();
  await expect(page.locator('#cookie-analytics')).not.toBeChecked();
});

test('rejette un cookie invalide ou d’une ancienne version', async ({ context, page }) => {
  await context.addCookies([{ name: consentCookie, value: encodeURIComponent('{"version":0}'), url: 'http://127.0.0.1:4173/' }]);
  await page.goto('/');
  await expect(page.locator('#cookie-banner')).toBeVisible();
});

test('n’active un script optionnel qu’après consentement', async ({ page }) => {
  await page.route('http://127.0.0.1:4173/', async (route) => {
    const response = await route.fetch();
    const html = (await response.text()).replace(
      '<script src="js/cookies.js" defer></script>',
      '<script type="text/plain" data-cookie-category="analytics">window.optionalScriptRan = true;</script><script src="js/cookies.js" defer></script>'
    );
    await route.fulfill({ response, body: html });
  });
  await page.goto('/');
  expect(await page.evaluate(() => window.optionalScriptRan)).toBeUndefined();
  await page.getByRole('button', { name: 'Tout accepter' }).click();
  await expect.poll(() => page.evaluate(() => window.optionalScriptRan)).toBe(true);
});
