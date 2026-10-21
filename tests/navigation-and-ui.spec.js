import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tout refuser' }).first().click();
});

test('le lien d’évitement cible le contenu principal', async ({ page }) => {
  await page.reload();
  const skipLink = page.getByRole('link', { name: 'Aller au contenu' });
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('la navigation desktop suit la section sélectionnée', async ({ page, isMobile }) => {
  test.skip(isMobile, 'La navigation desktop est masquée sur mobile.');
  const contactLink = page.locator('.desktop-nav a[href="#contact"]');
  await contactLink.click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(contactLink).toHaveAttribute('aria-current', 'location');

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(contactLink).toHaveClass(/active/);
});

test('le menu mobile synchronise ARIA et se ferme après navigation', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Ce scénario cible le menu mobile.');
  const menu = page.locator('.mobile-menu');
  const summary = menu.locator('summary');
  await summary.click();
  await expect(menu).toHaveAttribute('open', '');
  await expect(summary).toHaveAttribute('aria-expanded', 'true');
  await menu.locator('a[href="#services"]').click();
  await expect(menu).not.toHaveAttribute('open', '');
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
});

test('le carrousel se duplique et peut être mis en pause', async ({ page }) => {
  await expect(page.locator('.tech-group[data-clone]').first()).toBeAttached();
  const toggle = page.locator('#tech-motion-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toHaveAttribute('aria-label', 'Relancer le carrousel');
  await expect(page.locator('#tech-track')).toHaveClass(/is-paused/);
});

test('la section contact s’active lorsqu’elle entre dans la fenêtre', async ({ page }) => {
  const panel = page.locator('.contact-panel');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveClass(/is-in-view/);
});

test('le son est désactivé par défaut et ses contrôles sont accessibles', async ({ page }) => {
  const toggle = page.locator('#ambient-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(toggle).toHaveAttribute('aria-label', 'Activer la musique d’ambiance');
  await expect(page.locator('#ambient-status')).toHaveText('Son désactivé');
  await expect(page.locator('#ambient-volume')).toHaveAttribute('min', '0');
  await expect(page.locator('#ambient-volume')).toHaveAttribute('max', '100');
});

test('les liens externes isolent la fenêtre d’origine', async ({ page }) => {
  const links = page.locator('a[target="_blank"]');
  await expect(links).toHaveCount(3);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
    await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);
    await expect(link).toHaveAttribute('href', /^https:\/\//);
  }
});
