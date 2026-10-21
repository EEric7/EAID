(() => {
  const contactPanel = document.querySelector('.contact-panel');
  if (!contactPanel) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    return;
  }

  let entrancePlayed = false;
  const observer = new IntersectionObserver(([entry]) => {
    contactPanel.classList.toggle('is-in-view', entry.isIntersecting);
    if (!entry.isIntersecting || entrancePlayed) return;
    entrancePlayed = true;
    contactPanel.classList.add('contact-motion', 'is-visible');
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

  observer.observe(contactPanel);
})();
