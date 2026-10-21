(() => {
  const carousel = document.querySelector('.tech-carousel');
  const track = document.getElementById('tech-track');
  const sourceGroup = track?.querySelector('.tech-group');
  const motionToggle = document.getElementById('tech-motion-toggle');

  if (!carousel || !track || !sourceGroup) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const rebuildCarousel = () => {
    track.querySelectorAll('.tech-group[data-clone]').forEach((group) => group.remove());

    const groupWidth = sourceGroup.getBoundingClientRect().width;
    if (!groupWidth) return;

    const cloneCount = Math.max(1, Math.ceil(carousel.clientWidth / groupWidth) + 1);
    for (let index = 0; index < cloneCount; index += 1) {
      const clone = sourceGroup.cloneNode(true);
      clone.dataset.clone = '';
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }

    track.style.setProperty('--tech-shift', `${groupWidth}px`);
    track.style.setProperty('--tech-duration', `${Math.max(24, groupWidth / 52)}s`);
    track.classList.add('is-ready');
  };

  let resizeFrame;
  const scheduleRebuild = () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(rebuildCarousel);
  };

  rebuildCarousel();
  window.addEventListener('load', rebuildCarousel, { once: true });
  window.addEventListener('resize', scheduleRebuild);
  reducedMotion.addEventListener?.('change', rebuildCarousel);

  motionToggle?.addEventListener('click', () => {
    const isPaused = track.classList.toggle('is-paused');
    motionToggle.setAttribute('aria-pressed', String(isPaused));
    motionToggle.setAttribute('aria-label', isPaused ? 'Relancer le carrousel' : 'Mettre le carrousel en pause');
    const label = motionToggle.querySelector('span');
    if (label) label.textContent = isPaused ? 'Relancer le carrousel' : 'Mettre en pause';
  });
})();
