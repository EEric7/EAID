(() => {
  const sectionIds = ['accueil', 'expertise', 'services', 'realisations', 'apropos', 'contact'];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  const navigationLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-menu nav a[href^="#"]')];
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileSummary = mobileMenu?.querySelector('summary');

  if (!sections.length || !navigationLinks.length) return;

  const setCurrentSection = (sectionId) => {
    navigationLinks.forEach((link) => {
      const isCurrent = link.hash === `#${sectionId}`;
      link.classList.toggle('active', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const updateCurrentSection = () => {
    const readingLine = Math.min(180, window.innerHeight * 0.3);
    const atPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let current = sections[0];

    if (atPageEnd) {
      current = sections[sections.length - 1];
    } else {
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= readingLine) current = section;
      });
    }

    setCurrentSection(current.id);
  };

  let frameRequested = false;
  const requestUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(() => {
      updateCurrentSection();
      frameRequested = false;
    });
  };

  navigationLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setCurrentSection(link.hash.slice(1));
      if (mobileMenu?.open) mobileMenu.open = false;
    });
  });

  mobileMenu?.addEventListener('toggle', () => {
    mobileSummary?.setAttribute('aria-expanded', String(mobileMenu.open));
  });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateCurrentSection();
})();
