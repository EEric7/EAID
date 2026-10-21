/* EAI Digital — ambiance synthétique originale créée en temps réel avec Web Audio API.
   Aucun fichier musical tiers, aucun téléchargement, aucune lecture automatique. */
(() => {
  'use strict';
  const toggle = document.getElementById('ambient-toggle');
  const volume = document.getElementById('ambient-volume');
  const status = document.getElementById('ambient-status');
  const panel = document.querySelector('.ambient-player');
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!toggle || !volume || !status || !panel) return;
  if (!AudioContextClass) {
    toggle.disabled = true;
    status.textContent = 'Audio non pris en charge';
    return;
  }

  let context = null;
  let master = null;
  let timer = null;
  let step = 0;
  let playing = false;
  const progression = [
    [130.81, 155.56, 196.00, 233.08], // Cm7
    [103.83, 155.56, 196.00, 233.08], // Abmaj9 (voicing)
    [116.54, 146.83, 174.61, 233.08], // Bb sus
    [103.83, 130.81, 155.56, 207.65]  // Abmaj7
  ];
  const chordDuration = 7.5;

  function playChord() {
    if (!playing || !context || !master) return;
    const now = context.currentTime;
    const notes = progression[step % progression.length];
    step++;
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const filter = context.createBiquadFilter();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      filter.type = 'lowpass';
      filter.frequency.value = 580;
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.linearRampToValueAtTime(index === 0 ? 0.13 : 0.065, now + 1.8);
      envelope.gain.setValueAtTime(index === 0 ? 0.13 : 0.065, now + chordDuration - 2);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration + 0.8);
      oscillator.connect(filter);
      filter.connect(envelope);
      envelope.connect(master);
      oscillator.start(now);
      oscillator.stop(now + chordDuration + 0.9);
      oscillator.onended = () => { oscillator.disconnect(); filter.disconnect(); envelope.disconnect(); };
    });
  }

  function updateUI() {
    panel.classList.toggle('is-playing', playing);
    toggle.textContent = playing ? 'Ⅱ' : '▶';
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Désactiver la musique d’ambiance' : 'Activer la musique d’ambiance');
    status.textContent = playing ? 'Ambient synth • en lecture' : 'Son désactivé';
  }

  async function start() {
    try {
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);
      await context.resume();
      playing = true;
      step = 0;
      const target = (Number(volume.value) / 100) * 0.5;
      master.gain.setTargetAtTime(target, context.currentTime, 0.4);
      playChord();
      timer = window.setInterval(playChord, chordDuration * 1000);
      updateUI();
    } catch (error) {
      console.error('Lecture audio impossible :', error);
      playing = false;
      status.textContent = 'Audio indisponible';
      if (context) await context.close().catch(() => {});
      context = null;
    }
  }

  async function stop() {
    playing = false;
    window.clearInterval(timer);
    timer = null;
    updateUI();
    if (!context) return;
    const previous = context;
    if (master) master.gain.setTargetAtTime(0, previous.currentTime, 0.12);
    context = null;
    master = null;
    window.setTimeout(() => previous.close().catch(() => {}), 450);
  }

  toggle.addEventListener('click', () => { if (playing) stop(); else start(); });
  volume.addEventListener('input', () => {
    if (context && master) master.gain.setTargetAtTime((Number(volume.value) / 100) * 0.5, context.currentTime, 0.08);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) stop();
  });
  updateUI();
})();
