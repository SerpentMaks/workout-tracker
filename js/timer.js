// BentoFit Smart Rest Timer Engine
(function () {
  let timerInterval = null;
  let targetEndTime = null;
  let totalDuration = 90;
  let isPaused = false;
  let remainingWhenPaused = 0;

  window.BentoTimer = {
    onTick: null, // Callback (remainingSeconds, percent)
    onComplete: null, // Callback ()

    isRunning: function () {
      return !!targetEndTime && !isPaused;
    },

    getRemainingSeconds: function () {
      if (!targetEndTime) return 0;
      if (isPaused) return Math.max(0, Math.ceil(remainingWhenPaused / 1000));
      const diff = targetEndTime - Date.now();
      return Math.max(0, Math.ceil(diff / 1000));
    },

    getTotalDuration: function () {
      return totalDuration;
    },

    start: function (seconds) {
      this.stop();
      const settings = window.BentoStorage.getSettings();
      totalDuration = seconds !== undefined ? seconds : (settings.defaultRestSeconds || 90);
      targetEndTime = Date.now() + totalDuration * 1000;
      isPaused = false;

      this.updateUI();
      this.tick();

      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        this.tick();
      }, 500);

      // Show floating timer bar/pill
      const pill = document.getElementById('floating-timer-pill');
      if (pill) pill.classList.remove('hidden');
    },

    addSeconds: function (seconds) {
      if (!targetEndTime) {
        this.start(seconds > 0 ? seconds : 30);
        return;
      }
      if (isPaused) {
        remainingWhenPaused = Math.max(0, remainingWhenPaused + seconds * 1000);
      } else {
        targetEndTime += seconds * 1000;
      }
      totalDuration = Math.max(totalDuration, this.getRemainingSeconds());
      this.tick();
    },

    pause: function () {
      if (!targetEndTime || isPaused) return;
      isPaused = true;
      remainingWhenPaused = Math.max(0, targetEndTime - Date.now());
      this.updateUI();
    },

    resume: function () {
      if (!targetEndTime || !isPaused) return;
      isPaused = false;
      targetEndTime = Date.now() + remainingWhenPaused;
      this.tick();
    },

    togglePause: function () {
      if (isPaused) this.resume();
      else this.pause();
    },

    stop: function () {
      clearInterval(timerInterval);
      timerInterval = null;
      targetEndTime = null;
      isPaused = false;
      remainingWhenPaused = 0;

      const pill = document.getElementById('floating-timer-pill');
      if (pill) pill.classList.add('hidden');

      const modal = document.getElementById('rest-timer-modal');
      if (modal) modal.classList.add('hidden');

      if (this.onTick) this.onTick(0, 0);
    },

    tick: function () {
      const remaining = this.getRemainingSeconds();
      const percent = totalDuration > 0 ? Math.min(100, Math.max(0, ((totalDuration - remaining) / totalDuration) * 100)) : 0;

      if (this.onTick) {
        this.onTick(remaining, percent);
      }
      this.updateUI(remaining, percent);

      if (remaining <= 0 && targetEndTime) {
        this.handleComplete();
      }
    },

    handleComplete: function () {
      this.stop();
      window.BentoFeedback.playRestCompleteChord();
      window.BentoFeedback.hapticRestComplete();

      if (this.onComplete) {
        this.onComplete();
      }

      // Show quick toast notification
      if (window.BentoApp && window.BentoApp.showToast) {
        window.BentoApp.showToast('🔔 Отдых окончен! Время следующего подхода', 'accent');
      }
    },

    formatTime: function (totalSec) {
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },

    updateUI: function (rem, pct) {
      const remaining = rem !== undefined ? rem : this.getRemainingSeconds();
      const percent = pct !== undefined ? pct : 0;
      const formatted = this.formatTime(remaining);

      // Update floating pill
      const pillTime = document.getElementById('timer-pill-time');
      if (pillTime) pillTime.textContent = formatted;

      const pillRing = document.getElementById('timer-pill-progress');
      if (pillRing) {
        const circumference = 2 * Math.PI * 14; // r=14
        const offset = circumference - (percent / 100) * circumference;
        pillRing.style.strokeDasharray = `${circumference} ${circumference}`;
        pillRing.style.strokeDashoffset = offset;
      }

      // Update full modal if open
      const modalTime = document.getElementById('modal-timer-time');
      if (modalTime) modalTime.textContent = formatted;

      const modalRing = document.getElementById('modal-timer-progress');
      if (modalRing) {
        const circumference = 2 * Math.PI * 70; // r=70
        const offset = circumference - (percent / 100) * circumference;
        modalRing.style.strokeDasharray = `${circumference} ${circumference}`;
        modalRing.style.strokeDashoffset = offset;
      }
    },
  };
})();
