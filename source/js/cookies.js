(() => {
  'use strict';

  const COOKIE_NAME = 'eai_cookie_consent';
  const CONSENT_VERSION = 1;
  const SIX_MONTHS = 60 * 60 * 24 * 183;

  const banner = document.getElementById('cookie-banner');
  const dialog = document.getElementById('cookie-dialog');
  const form = document.getElementById('cookie-form');
  const preferencesInput = document.getElementById('cookie-preferences');
  const analyticsInput = document.getElementById('cookie-analytics');
  const manageButton = document.getElementById('cookie-manage');
  const settingsButton = document.getElementById('cookie-settings');
  const acceptButton = document.getElementById('cookie-accept');
  const rejectButton = document.getElementById('cookie-reject');
  const dialogRejectButton = document.getElementById('cookie-dialog-reject');
  let appliedConsent = null;

  if (!banner || !dialog || !form || !preferencesInput || !analyticsInput) return;

  const defaultConsent = () => ({
    version: CONSENT_VERSION,
    necessary: true,
    preferences: false,
    analytics: false,
    updatedAt: new Date().toISOString()
  });

  function readConsent() {
    const prefix = `${COOKIE_NAME}=`;
    const entry = document.cookie.split('; ').find((item) => item.startsWith(prefix));
    if (!entry) return null;

    try {
      const consent = JSON.parse(decodeURIComponent(entry.slice(prefix.length)));
      if (consent.version !== CONSENT_VERSION || consent.necessary !== true) return null;
      return {
        ...defaultConsent(),
        preferences: consent.preferences === true,
        analytics: consent.analytics === true,
        updatedAt: consent.updatedAt || new Date().toISOString()
      };
    } catch {
      return null;
    }
  }

  function writeConsent(consent) {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${SIX_MONTHS}; Path=/; SameSite=Lax${secure}`;
  }

  function activateScripts(category) {
    document.querySelectorAll(`script[type="text/plain"][data-cookie-category="${category}"]`).forEach((blockedScript) => {
      if (blockedScript.dataset.cookieActivated === 'true') return;
      const script = document.createElement('script');
      [...blockedScript.attributes].forEach(({ name, value }) => {
        if (name !== 'type' && name !== 'data-cookie-category' && name !== 'data-cookie-activated') {
          script.setAttribute(name, value);
        }
      });
      script.textContent = blockedScript.textContent;
      script.dataset.cookieActiveCategory = category;
      blockedScript.dataset.cookieActivated = 'true';
      blockedScript.after(script);
    });
  }

  function deactivateScripts(category) {
    document.querySelectorAll(`script[data-cookie-active-category="${category}"]`).forEach((script) => script.remove());
    document.querySelectorAll(`script[type="text/plain"][data-cookie-category="${category}"]`).forEach((blockedScript) => {
      delete blockedScript.dataset.cookieActivated;
    });
  }

  function applyConsent(consent, revokedCategories = []) {
    document.documentElement.dataset.cookiePreferences = String(consent.preferences);
    document.documentElement.dataset.cookieAnalytics = String(consent.analytics);
    revokedCategories.forEach(deactivateScripts);
    if (consent.preferences) activateScripts('preferences');
    if (consent.analytics) activateScripts('analytics');
    appliedConsent = consent;
    window.dispatchEvent(new CustomEvent('cookieconsentchange', {
      detail: { ...consent, revokedCategories: [...revokedCategories] }
    }));
  }

  function closeBanner() {
    banner.hidden = true;
  }

  function saveConsent(values) {
    const previousConsent = appliedConsent || readConsent() || defaultConsent();
    const consent = { ...defaultConsent(), ...values, necessary: true };
    const revokedCategories = ['preferences', 'analytics'].filter(
      (category) => previousConsent[category] === true && consent[category] !== true
    );

    writeConsent(consent);
    applyConsent(consent, revokedCategories);
    closeBanner();
    if (dialog.open) dialog.close();

    if (revokedCategories.length) {
      window.location.reload();
    }
  }

  function setFormValues(consent = defaultConsent()) {
    preferencesInput.checked = consent.preferences;
    analyticsInput.checked = consent.analytics;
  }

  function openSettings() {
    setFormValues(readConsent() || defaultConsent());
    if (!dialog.open) dialog.showModal();
  }

  acceptButton?.addEventListener('click', () => saveConsent({ preferences: true, analytics: true }));
  rejectButton?.addEventListener('click', () => saveConsent({ preferences: false, analytics: false }));
  dialogRejectButton?.addEventListener('click', () => saveConsent({ preferences: false, analytics: false }));
  settingsButton?.addEventListener('click', openSettings);
  manageButton?.addEventListener('click', openSettings);

  form.addEventListener('submit', (event) => {
    const submitter = event.submitter;
    if (submitter?.value !== 'save') return;
    event.preventDefault();
    saveConsent({ preferences: preferencesInput.checked, analytics: analyticsInput.checked });
  });

  const existingConsent = readConsent();
  if (existingConsent) {
    applyConsent(existingConsent);
  } else {
    banner.hidden = false;
  }
})();
