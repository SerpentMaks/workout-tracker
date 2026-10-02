// BentoFit Audio & Haptic Feedback Engine
(function () {
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Pre-unlock on first user interaction for iOS Safari
  document.addEventListener('touchstart', function unlockAudio() {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {}
    document.removeEventListener('touchstart', unlockAudio);
  }, { passive: true, once: true });

  window.BentoFeedback = {
    // Play 3-tone harmonic chord for rest timer completion
    playRestCompleteChord: function () {
      const settings = window.BentoStorage.getSettings();
      if (!settings.soundEnabled) return;

      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        // Triad notes: C5 (523.25 Hz), E5 (659.25 Hz), G5 (783.99 Hz)
        const notes = [523.25, 659.25, 783.99];

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          // Volume envelope
          gain.gain.setValueAtTime(0.001, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.9);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.95);
        });
      } catch (err) {
        console.warn('Audio playback not supported or blocked:', err);
      }
    },

    // Gentle click sound for checking a set
    playSetCompleteClick: function () {
      const settings = window.BentoStorage.getSettings();
      if (!settings.soundEnabled) return;

      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
      } catch (e) {}
    },

    // Haptic feedback for checking set
    hapticSetCheck: function () {
      const settings = window.BentoStorage.getSettings();
      if (!settings.vibrationEnabled) return;
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(35);
        } catch (e) {}
      }
    },

    // Haptic feedback for rest finished
    hapticRestComplete: function () {
      const settings = window.BentoStorage.getSettings();
      if (!settings.vibrationEnabled) return;
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([120, 60, 160, 60, 240]);
        } catch (e) {}
      }
    },
  };
})();
