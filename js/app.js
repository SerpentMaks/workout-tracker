// BentoFit Application Controller
(function () {
  'use strict';

  // Global App State
  const AppState = {
    currentTab: 'home',
    activeWorkout: null, // Active workout session
    workoutTimerInterval: null,
    editingTemplateId: null,
    editingExerciseId: null,
    exercisePickerTarget: 'workout',
    selectedExerciseCategory: 'all',
    searchQuery: '',
  };

  window.BentoApp = {
    init: function () {
      this.updateAppHeight();
      window.addEventListener('resize', () => this.updateAppHeight());
      window.addEventListener('orientationchange', () => this.updateAppHeight());
      if (window.matchMedia) {
        const scheme = window.matchMedia('(prefers-color-scheme: dark)');
        scheme.addEventListener('change', () => {
          if (window.BentoStorage.getSettings().theme === 'system') this.applySavedThemeAndAccent();
        });
      }
      this.applySavedThemeAndAccent();
      this.bindTabNavigation();
      this.bindHeaderActions();
      this.bindFloatingTimer();
      this.bindActiveWorkout();
      this.bindExerciseCatalog();
      this.bindTemplatesAndSchedule();
      this.bindAnalyticsAndCalendar();
      this.bindProfileAndSettings();

      // Check if there is an active workout to restore
      const savedActive = window.BentoStorage.getActiveWorkout();
      if (savedActive) {
        AppState.activeWorkout = savedActive;
        this.resumeActiveWorkoutTimer();
      }

      // Initial View Render
      this.renderHomeBento();
      this.renderTemplates();
      this.renderExercises();
      this.renderAnalytics();
      this.renderProfile();

      if (AppState.activeWorkout) {
        this.showToast('Возобновлена активная тренировка', 'info');
      }
    },

    updateAppHeight: function () {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty('--app-height', vh + 'px');
    },

    // ----------------------------------------------------
    // Theming & Accent Controls
    // ----------------------------------------------------
    applySavedThemeAndAccent: function () {
      const settings = window.BentoStorage.getSettings();
      const preference = settings.theme || 'dark';
      const effectiveTheme = preference === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : preference;
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.setAttribute('data-theme-preference', preference);
      document.documentElement.setAttribute('data-style', settings.uiStyle === 'metamorphism' ? 'metamorphism' : 'bento');
      document.documentElement.setAttribute('data-accent', settings.accent || 'violet');
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', effectiveTheme === 'dark' ? '#171d29' : '#f3f2ed');

      const sunIcon = document.getElementById('theme-icon-sun');
      const moonIcon = document.getElementById('theme-icon-moon');
      if (sunIcon && moonIcon) {
        if (effectiveTheme === 'light') {
          sunIcon.classList.add('hidden');
          moonIcon.classList.remove('hidden');
        } else {
          sunIcon.classList.remove('hidden');
          moonIcon.classList.add('hidden');
        }
      }

      const unitLabel = document.getElementById('header-unit-label');
      if (unitLabel) {
        unitLabel.textContent = (settings.unit || 'kg').toUpperCase();
      }

      document.querySelectorAll('.unit-label').forEach((el) => {
        el.textContent = settings.unit || 'kg';
      });
    },

    toggleTheme: function () {
      const settings = window.BentoStorage.getSettings();
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      window.BentoStorage.saveSettings({ theme: newTheme });
      this.applySavedThemeAndAccent();
      this.showToast(`Тема переключена на ${newTheme === 'dark' ? 'Тёмную' : 'Светлую'}`);
    },

    toggleUnit: function () {
      const settings = window.BentoStorage.getSettings();
      const newUnit = settings.unit === 'kg' ? 'lbs' : 'kg';
      window.BentoStorage.saveSettings({ unit: newUnit });
      this.applySavedThemeAndAccent();
      this.renderHomeBento();
      this.renderTemplates();
      this.renderAnalytics();
      this.renderProfile();
      if (AppState.activeWorkout) {
        this.renderActiveWorkoutSets();
        this.updateActiveWorkoutMetricsTicker();
      }
      this.showToast(`Единицы веса: ${newUnit.toUpperCase()}`);
    },

    setAccentColor: function (accentName) {
      window.BentoStorage.saveSettings({ accent: accentName });
      this.applySavedThemeAndAccent();
      document.querySelectorAll('.accent-color-circle').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-accent') === accentName);
      });
      this.showToast('Цветовой акцент обновлен');
    },

    // ----------------------------------------------------
    // Toast Notification System
    // ----------------------------------------------------
    showToast: function (msg, type) {
      const toast = document.getElementById('app-toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.remove('hidden');

      if (window._toastTimeout) clearTimeout(window._toastTimeout);
      window._toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
      }, 2500);
    },

    escapeHtml: function (value) {
      return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char]);
    },

    sanitizeSvgMarkup: function (markup) {
      if (typeof markup !== 'string' || !markup.trim()) return '';

      try {
        const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
        const root = parsed.documentElement;
        if (!root || root.nodeName.toLowerCase() !== 'svg' || parsed.querySelector('parsererror')) {
          return '';
        }

        const allowedTags = new Set(['svg', 'g', 'path', 'circle', 'line', 'rect', 'polyline', 'polygon', 'ellipse']);
        const allowedAttributes = new Set([
          'viewbox', 'class', 'd', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
          'rx', 'ry', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
          'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'transform',
          'points', 'vector-effect', 'preserveaspectratio',
        ]);

        Array.from(root.querySelectorAll('*')).forEach((element) => {
          if (!allowedTags.has(element.nodeName.toLowerCase())) {
            element.remove();
          }
        });

        [root, ...Array.from(root.querySelectorAll('*'))].forEach((element) => {
          Array.from(element.attributes).forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value.toLowerCase();
            if (!allowedAttributes.has(name) || name.startsWith('on') || /javascript:|data:|url\s*\(/i.test(value)) {
              element.removeAttribute(attribute.name);
            }
          });
        });

        return root.outerHTML;
      } catch (e) {
        return '';
      }
    },

    // ----------------------------------------------------
    // Tab Navigation
    // ----------------------------------------------------
    bindTabNavigation: function () {
      const tabButtons = document.querySelectorAll('.tab-btn');
      tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const tabId = btn.getAttribute('data-tab');
          this.switchTab(tabId);
        });
      });
    },

    switchTab: function (tabId) {
      AppState.currentTab = tabId;
      document.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
      });
      document.querySelectorAll('.view-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === `view-${tabId}`);
      });

      if (tabId === 'home') this.renderHomeBento();
      else if (tabId === 'templates') this.renderTemplates();
      else if (tabId === 'exercises') this.renderExercises();
      else if (tabId === 'analytics') this.renderAnalytics();
      else if (tabId === 'profile') this.renderProfile();
    },

    bindHeaderActions: function () {
      const themeBtn = document.getElementById('header-theme-btn');
      if (themeBtn) {
        themeBtn.addEventListener('click', () => this.toggleTheme());
      }
      const unitBtn = document.getElementById('header-unit-btn');
      if (unitBtn) {
        unitBtn.addEventListener('click', () => this.toggleUnit());
      }
    },

    // ----------------------------------------------------
    // 1. HOME BENTO DASHBOARD RENDERER
    // ----------------------------------------------------
    renderHomeBento: function () {
      const container = document.getElementById('home-bento-container');
      if (!container) return;

      const scheduleInfo = window.BentoSchedule.getTodaySchedule();
      const stats = window.BentoAnalytics.getGlobalStats();
      const metrics = window.BentoStorage.getBodyMetrics();
      const settings = window.BentoStorage.getSettings();
      const unit = settings.unit || 'kg';

      let latestWeightStr = '--';
      if (metrics.logs && metrics.logs.length > 0) {
        const lastLog = metrics.logs[metrics.logs.length - 1];
        const converted = window.BentoStorage.convertWeight(lastLog.weight, unit);
        latestWeightStr = `${converted} ${unit}`;
      }

      const now = new Date();
      const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
      const dateStrRaw = now.toLocaleDateString('ru-RU', dateOptions);
      const dateStr = dateStrRaw.charAt(0).toUpperCase() + dateStrRaw.slice(1);

      let html = '';

      // TILE A: Active Workout Banner (if currently running)
      if (AppState.activeWorkout) {
        const totalSets = this.countTotalSets(AppState.activeWorkout);
        const compSets = this.countCompletedSets(AppState.activeWorkout);
        const exCount = AppState.activeWorkout.exercises ? AppState.activeWorkout.exercises.length : 0;

        html += `
          <div class="bento-card bento-active-card clickable" id="home-resume-workout-card">
            <div class="bento-card-header">
              <span class="bento-card-tag" style="color: var(--success);">
                <span class="pulse-indicator"></span> ИДЁТ ТРЕНИРОВКА
              </span>
              <span style="font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--success);" id="home-active-duration">
                ${this.formatDuration(AppState.activeWorkout.elapsedSeconds || 0)}
              </span>
            </div>
            <div class="bento-card-title">${this.escapeHtml(AppState.activeWorkout.title)}</div>
            <div class="bento-card-subtitle" style="margin-bottom: 12px;">
              Завершено сетов: <strong>${compSets}/${totalSets}</strong> • Упражнений: <strong>${exCount}</strong>
            </div>
            <button class="btn btn-primary btn-sm btn-block" style="background:var(--success); color:var(--background); border:none; box-shadow: var(--shadow-accent);" id="btn-home-resume">
              Возобновить тренировку
            </button>
          </div>
        `;
      }

      // TILE B: Hero Scheduled Workout for Today
      if (!scheduleInfo.isRest && scheduleInfo.template) {
        html += `
          <div class="bento-card bento-hero-card">
            <div class="bento-hero-top">
              <div>
                <span class="bento-card-tag accent">План на сегодня</span>
                <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 2px;">${dateStr}</div>
              </div>
              <span class="bento-badge-pill">День ${scheduleInfo.cycleDay} из ${scheduleInfo.cycleTotalDays}</span>
            </div>
            <div class="bento-card-title" style="font-size: 20px;">${this.escapeHtml(scheduleInfo.template.name)}</div>
            <div class="bento-card-subtitle">
              ${scheduleInfo.template.exercises.length} упражнений • ${this.escapeHtml(scheduleInfo.template.description || 'Силовая тренировка')}
            </div>
            <button class="btn btn-primary btn-block bento-hero-btn" id="btn-start-scheduled-workout" data-template-id="${this.escapeHtml(scheduleInfo.template.id)}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Начать запланированную тренировку
            </button>
          </div>
        `;
      } else {
        html += `
          <div class="bento-card bento-hero-card">
            <div class="bento-hero-top">
              <div>
                <span class="bento-card-tag accent">Сегодня по плану</span>
                <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 2px;">${dateStr}</div>
              </div>
              <span class="bento-badge-pill rest">День отдыха</span>
            </div>
            <div class="bento-card-title" style="font-size: 20px;">Восстановление и отдых 🧘</div>
            <div class="bento-card-subtitle">
              Мышцы растут во время отдыха.
              ${scheduleInfo.nextTemplate ? `<br>Следующая: <strong>${this.escapeHtml(scheduleInfo.nextTemplate.name)}</strong> через ${scheduleInfo.daysUntilNext} дн.` : ''}
            </div>
            <button class="btn btn-secondary btn-block bento-hero-btn" id="btn-home-free-start">
              ⚡ Тренироваться вне плана
            </button>
          </div>
        `;
      }

      // TILE C: Weekly Goal Progress Tile
      html += `
        <div class="bento-card bento-col-2">
          <div class="bento-card-header">
            <span class="bento-card-tag accent">Недельная цель</span>
            <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary);">${stats.weeklyCompleted} из ${this.escapeHtml(stats.weeklyGoal)} тренировок</span>
          </div>
          <div class="bento-card-title" style="font-size: 18px;">
            ${stats.weeklyCompleted >= stats.weeklyGoal ? 'Цель на неделю достигнута! 🔥' : `Осталось тренировок: ${Math.max(0, stats.weeklyGoal - stats.weeklyCompleted)}`}
          </div>
          <div class="bento-progress-bar-wrap">
            <div class="bento-progress-bar-fill" style="width: ${stats.weeklyPercent}%;"></div>
          </div>
          <div style="display:flex; justify-content: space-between; font-size: 11px; color: var(--text-tertiary);">
            <span>Пн</span>
            <span>${stats.weeklyPercent}% выполнено</span>
            <span>Вс</span>
          </div>
        </div>
      `;

      // TILE D: Total Workouts Count
      html += `
        <div class="bento-card bento-col-1">
          <div class="bento-card-header">
            <span class="bento-card-tag">Тренировки</span>
            <div class="bento-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="bento-stat-num">${stats.totalWorkouts}</div>
          <div class="bento-card-subtitle">Всего завершено</div>
        </div>
      `;

      // TILE E: Total Completed Sets Count
      html += `
        <div class="bento-card bento-col-1">
          <div class="bento-card-header">
            <span class="bento-card-tag">Подходы</span>
            <div class="bento-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <div class="bento-stat-num">${stats.totalCompletedSets}</div>
          <div class="bento-card-subtitle">Выполнено сетов</div>
        </div>
      `;

      // TILE F: Last Workout Summary
      if (stats.lastWorkout) {
        const lastDate = new Date(stats.lastWorkout.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        html += `
          <div class="bento-card bento-col-1 clickable" id="home-last-workout-card" data-workout-id="${this.escapeHtml(stats.lastWorkout.id)}">
            <div class="bento-card-header">
              <span class="bento-card-tag">Прошлая</span>
              <div class="bento-card-icon" style="background: color-mix(in srgb, var(--success) 14%, transparent); color: var(--success);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <div style="font-size: 14px; font-weight: 800; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${this.escapeHtml(stats.lastWorkout.title)}
            </div>
            <div class="bento-card-subtitle" style="margin-top: 4px;">
              ${lastDate} • <strong>${this.escapeHtml(stats.lastWorkout.completedSets || 0)} сетов</strong>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="bento-card bento-col-1">
            <div class="bento-card-header">
              <span class="bento-card-tag">Прошлая</span>
            </div>
            <div class="bento-card-subtitle">Пока нет записей</div>
          </div>
        `;
      }

      // TILE G: Current Body Weight
      html += `
        <div class="bento-card bento-col-1 clickable" id="home-weight-tile">
          <div class="bento-card-header">
            <span class="bento-card-tag">Вес тела</span>
            <div class="bento-card-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <div class="bento-stat-num" style="font-size: 22px;">${this.escapeHtml(latestWeightStr)}</div>
          <div class="bento-card-subtitle">Нажмите для замера</div>
        </div>
      `;

      // TILE H: Quick Action Buttons
      html += `
        <div class="bento-action-tile bento-col-2" id="btn-home-quick-free">
          <div class="bento-action-tile-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div class="bento-action-tile-text">
            <div class="bento-action-tile-title">Свободная тренировка</div>
            <div class="bento-action-tile-sub">Быстрый старт с добавлением любых упражнений на лету</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        <div class="bento-action-tile bento-col-2" id="btn-home-browse-templates">
          <div class="bento-action-tile-icon" style="background: color-mix(in srgb, var(--secondary-accent) 14%, transparent); color: var(--secondary-accent);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <div class="bento-action-tile-text">
            <div class="bento-action-tile-title">Выбрать готовую программу</div>
            <div class="bento-action-tile-sub">Каталог шаблонов: Push/Pull/Legs и конструктор</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      `;

      container.innerHTML = html;

      // Bind Home Card Events
      const btnStartScheduled = document.getElementById('btn-start-scheduled-workout');
      if (btnStartScheduled) {
        btnStartScheduled.addEventListener('click', () => {
          const tplId = btnStartScheduled.getAttribute('data-template-id');
          this.startWorkoutFromTemplate(tplId);
        });
      }

      const btnHomeFree = document.getElementById('btn-home-free-start');
      if (btnHomeFree) {
        btnHomeFree.addEventListener('click', () => this.startFreeWorkout());
      }

      const btnHomeQuickFree = document.getElementById('btn-home-quick-free');
      if (btnHomeQuickFree) {
        btnHomeQuickFree.addEventListener('click', () => this.startFreeWorkout());
      }

      const btnHomeBrowse = document.getElementById('btn-home-browse-templates');
      if (btnHomeBrowse) {
        btnHomeBrowse.addEventListener('click', () => this.switchTab('templates'));
      }

      const homeResume = document.getElementById('home-resume-workout-card');
      if (homeResume) {
        homeResume.addEventListener('click', () => this.openActiveWorkoutScreen());
      }

      const homeLastWorkout = document.getElementById('home-last-workout-card');
      if (homeLastWorkout) {
        homeLastWorkout.addEventListener('click', () => {
          const wId = homeLastWorkout.getAttribute('data-workout-id');
          this.openPastWorkoutModal(wId);
        });
      }

      const homeWeightTile = document.getElementById('home-weight-tile');
      if (homeWeightTile) {
        homeWeightTile.addEventListener('click', () => this.openWeightModal());
      }
    },

    // ----------------------------------------------------
    // 2. TEMPLATES & SCHEDULE ENGINE RENDERER
    // ----------------------------------------------------
    renderTemplates: function () {
      const scheduleContainer = document.getElementById('schedule-cycle-card');
      const listContainer = document.getElementById('templates-list-container');
      if (!listContainer) return;

      const scheduleConfig = window.BentoStorage.getSchedule();
      const scheduleInfo = window.BentoSchedule.getTodaySchedule();
      const templates = window.BentoStorage.getTemplates();

      if (scheduleContainer) {
        const seqNames = (scheduleConfig.sequence || []).map((id) => {
          if (id === 'REST') return 'Отдых';
          const t = window.BentoStorage.getTemplateById(id);
          return t ? t.name.split(':')[0] : 'Программа';
        }).join(' → ');

        scheduleContainer.innerHTML = `
          <div class="bento-hero-top">
            <div>
              <span class="bento-card-tag accent">Циклическое расписание</span>
              <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">
                Интервал отдыха: ${this.escapeHtml(scheduleConfig.intervalDays || 1)} дн. • День цикла: ${scheduleInfo.cycleDay}/${scheduleInfo.cycleTotalDays}
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-edit-schedule-modal">Настроить</button>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin: 6px 0 10px 0; word-break: break-word;">
            <strong>Ротация:</strong> ${this.escapeHtml(seqNames)}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; background: var(--pill-bg); padding: 8px 12px; border-radius: var(--radius-sm);">
            <span>Статус на сегодня:</span>
            <strong style="color: ${scheduleInfo.isRest ? 'var(--text-tertiary)' : 'var(--accent)'};">
              ${scheduleInfo.isRest ? '🧘 День отдыха' : `🏋️ ${scheduleInfo.template ? this.escapeHtml(scheduleInfo.template.name) : 'Тренировка'}`}
            </strong>
          </div>
        `;

        const btnEditSched = document.getElementById('btn-edit-schedule-modal');
        if (btnEditSched) {
          btnEditSched.addEventListener('click', () => this.openScheduleConfigModal());
        }
      }

      if (templates.length === 0) {
        listContainer.innerHTML = `
          <div style="text-align: center; padding: 30px 20px; color: var(--text-tertiary);">
            Нет сохранённых программ. Создайте первую программу с помощью кнопки "+ Создать".
          </div>
        `;
        return;
      }

      listContainer.innerHTML = templates.map((tpl) => {
        const exNames = tpl.exercises.map((e) => {
          const exObj = window.BentoStorage.getExerciseById(e.exerciseId);
          return exObj ? exObj.name : 'Упражнение';
        }).slice(0, 3).join(', ') + (tpl.exercises.length > 3 ? ' и др.' : '');

        const totalTargetSets = tpl.exercises.reduce((sum, e) => sum + (e.targetSets || 3), 0);

        return `
          <div class="bento-card bento-col-2">
            <div class="bento-card-header">
              <span class="bento-card-tag accent">${tpl.exercises.length} упражнений • ${this.escapeHtml(totalTargetSets)} сетов</span>
              <div style="display: flex; gap: 6px;">
                <button class="icon-btn btn-sm btn-edit-template" data-tpl-id="${this.escapeHtml(tpl.id)}" title="Редактировать">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
            </div>
            <div class="bento-card-title">${this.escapeHtml(tpl.name)}</div>
            <div class="bento-card-subtitle" style="margin-bottom: 8px;">${this.escapeHtml(tpl.description || '')}</div>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 12px;">
              <strong>Состав:</strong> ${this.escapeHtml(exNames)}
            </div>
            <button class="btn btn-primary btn-block btn-sm btn-start-tpl" data-tpl-id="${this.escapeHtml(tpl.id)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Начать тренировку по программе
            </button>
          </div>
        `;
      }).join('');

      listContainer.querySelectorAll('.btn-start-tpl').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tplId = btn.getAttribute('data-tpl-id');
          this.startWorkoutFromTemplate(tplId);
        });
      });

      listContainer.querySelectorAll('.btn-edit-template').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tplId = btn.getAttribute('data-tpl-id');
          this.openTemplateEditorModal(tplId);
        });
      });
    },

    bindTemplatesAndSchedule: function () {
      const btnCreateTpl = document.getElementById('btn-create-template');
      if (btnCreateTpl) {
        btnCreateTpl.addEventListener('click', () => this.openTemplateEditorModal(null));
      }
      const btnQuickFree = document.getElementById('btn-quick-free-workout');
      if (btnQuickFree) {
        btnQuickFree.addEventListener('click', () => this.startFreeWorkout());
      }
      const btnCloseTplEditor = document.getElementById('btn-close-tpl-editor');
      if (btnCloseTplEditor) {
        btnCloseTplEditor.addEventListener('click', () => this.closeTemplateEditorModal());
      }
      const btnSaveTpl = document.getElementById('btn-save-template');
      if (btnSaveTpl) {
        btnSaveTpl.addEventListener('click', () => this.saveTemplateFromEditor());
      }
      const btnDeleteTpl = document.getElementById('btn-delete-template');
      if (btnDeleteTpl) {
        btnDeleteTpl.addEventListener('click', () => this.deleteTemplateFromEditor());
      }
      const btnCloseSched = document.getElementById('btn-close-sched-modal');
      if (btnCloseSched) {
        btnCloseSched.addEventListener('click', () => this.closeScheduleConfigModal());
      }
      const btnSaveSched = document.getElementById('btn-save-schedule-config');
      if (btnSaveSched) {
        btnSaveSched.addEventListener('click', () => this.saveScheduleConfig());
      }
    },

    // ----------------------------------------------------
    // 3. EXERCISE CATALOG RENDERER & ACTIONS
    // ----------------------------------------------------
    renderExercises: function () {
      const container = document.getElementById('exercises-catalog-container');
      if (!container) return;

      const exercises = window.BentoStorage.getExercises();
      const category = AppState.selectedExerciseCategory;
      const query = (AppState.searchQuery || '').toLowerCase().trim();

      const filtered = exercises.filter((ex) => {
        const matchesCategory = category === 'all' || ex.category === category;
        const matchesQuery = !query ||
          ex.name.toLowerCase().includes(query) ||
          (ex.nameEn && ex.nameEn.toLowerCase().includes(query)) ||
          (ex.targetMuscles && ex.targetMuscles.some((m) => m.toLowerCase().includes(query)));
        return matchesCategory && matchesQuery;
      });

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
            Упражнения не найдены. Попробуйте изменить поисковый запрос или фильтр мышечной группы.
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map((ex) => {
        const musclesList = (ex.targetMuscles || []).join(', ');
        return `
          <div class="catalog-item-card" data-ex-id="${this.escapeHtml(ex.id)}">
            <div class="catalog-item-svg">
              ${this.sanitizeSvgMarkup(ex.svgIcon)}
            </div>
            <div class="catalog-item-info">
              <div class="catalog-item-name">${this.escapeHtml(ex.name)}</div>
              <div class="catalog-item-meta">
                <span class="category-tag">${this.escapeHtml(ex.categoryName || ex.category)}</span>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">${this.escapeHtml(musclesList)}</span>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2" style="flex-shrink:0;"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.catalog-item-card').forEach((card) => {
        card.addEventListener('click', () => {
          const exId = card.getAttribute('data-ex-id');
          this.openExerciseDetailModal(exId);
        });
      });
    },

    bindExerciseCatalog: function () {
      const searchInput = document.getElementById('exercise-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          AppState.searchQuery = e.target.value;
          this.renderExercises();
        });
      }

      const filterControl = document.getElementById('muscle-filter-control');
      if (filterControl) {
        filterControl.querySelectorAll('.segment-item').forEach((btn) => {
          btn.addEventListener('click', () => {
            filterControl.querySelectorAll('.segment-item').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.selectedExerciseCategory = btn.getAttribute('data-category');
            this.renderExercises();
          });
        });
      }

      const btnCreateEx = document.getElementById('btn-create-exercise');
      if (btnCreateEx) {
        btnCreateEx.addEventListener('click', () => this.openCustomExerciseModal());
      }
      const btnCloseCustomEx = document.getElementById('btn-close-custom-ex');
      if (btnCloseCustomEx) {
        btnCloseCustomEx.addEventListener('click', () => {
          document.getElementById('custom-exercise-modal').classList.add('hidden');
        });
      }
      const btnSaveCustomEx = document.getElementById('btn-save-custom-exercise');
      if (btnSaveCustomEx) {
        btnSaveCustomEx.addEventListener('click', () => this.saveCustomExercise());
      }

      const btnCloseExDetail = document.getElementById('btn-close-exercise-detail');
      if (btnCloseExDetail) {
        btnCloseExDetail.addEventListener('click', () => {
          document.getElementById('exercise-detail-modal').classList.add('hidden');
        });
      }

      const btnCloseExHistory = document.getElementById('btn-close-ex-history');
      if (btnCloseExHistory) {
        btnCloseExHistory.addEventListener('click', () => {
          document.getElementById('exercise-history-modal').classList.add('hidden');
        });
      }

      const btnExport = document.getElementById('btn-export-exercises');
      if (btnExport) {
        btnExport.addEventListener('click', () => {
          const json = window.BentoStorage.exportExercises();
          this.downloadJsonFile(json, `bentofit_exercises_${this.getDateStamp()}.json`);
          this.showToast('База упражнений экспортирована в JSON');
        });
      }
      const btnImport = document.getElementById('btn-import-exercises');
      const inputImport = document.getElementById('input-import-exercises-file');
      if (btnImport && inputImport) {
        btnImport.addEventListener('click', () => inputImport.click());
        inputImport.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            const res = window.BentoStorage.importExercises(evt.target.result);
            if (res.success) {
              this.renderExercises();
              this.showToast(`Успешно импортировано упражнений: ${res.count}`);
            } else {
              alert('Ошибка импорта: ' + res.error);
            }
            inputImport.value = '';
          };
          reader.readAsText(file);
        });
      }
    },

    openExerciseDetailModal: function (exId) {
      const ex = window.BentoStorage.getExerciseById(exId);
      if (!ex) return;

      const modal = document.getElementById('exercise-detail-modal');
      const title = document.getElementById('ex-modal-title');
      const body = document.getElementById('ex-modal-body');

      title.textContent = ex.name;

      const inst = ex.instructions || {};
      const musclesList = (ex.targetMuscles || []).map((m) => `<span class="category-tag">${this.escapeHtml(m)}</span>`).join(' ');
      const unit = window.BentoStorage.getSettings().unit || 'kg';

      const lastPerf = window.BentoStorage.getLastPerformanceForExercise(exId);
      let pastPerfHtml = '<div style="font-size: 13px; color: var(--text-tertiary);">Пока нет выполненных подходов</div>';
      if (lastPerf && lastPerf.bestSet) {
        const perfDate = new Date(lastPerf.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        pastPerfHtml = `
          <div style="background: var(--pill-bg); padding: 10px 12px; border-radius: var(--radius-md); font-size: 13px;">
            <div style="color: var(--text-tertiary); font-size: 11px; margin-bottom: 2px;">ПОСЛЕДНИЙ РЕЗУЛЬТАТ (${perfDate})</div>
            <strong>${this.escapeHtml(window.BentoStorage.convertWeight(lastPerf.bestSet.weight, unit))} ${this.escapeHtml(unit)} × ${this.escapeHtml(lastPerf.bestSet.reps)} повт</strong>
          </div>
        `;
      }

      body.innerHTML = `
        <div class="exercise-modal-svg-box">
          ${this.sanitizeSvgMarkup(ex.svgIcon)}
        </div>

        <div style="margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 6px;">Целевые мышцы</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">${musclesList}</div>
        </div>

        <div style="margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 4px;">История в дневнике</div>
          ${pastPerfHtml}
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px;">
            <strong style="color: var(--accent); font-size: 13px; display: block; margin-bottom: 4px;">1. Исходное положение</strong>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${this.escapeHtml(inst.initial || 'Примите устойчивое исходное положение.')}</p>
          </div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px;">
            <strong style="color: var(--accent); font-size: 13px; display: block; margin-bottom: 4px;">2. Опускание (Негативная фаза)</strong>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${this.escapeHtml(inst.eccentric || 'Контролируйте снаряд при движении вниз.')}</p>
          </div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px;">
            <strong style="color: var(--accent); font-size: 13px; display: block; margin-bottom: 4px;">3. Подъём (Позитивная фаза)</strong>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${this.escapeHtml(inst.concentric || 'Выполняйте подъём за счёт целевых мышц.')}</p>
          </div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px;">
            <strong style="color: #06b6d4; font-size: 13px; display: block; margin-bottom: 4px;">💨 Дыхание</strong>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${this.escapeHtml(inst.breathing || 'Вдох на расслаблении, выдох на усилии.')}</p>
          </div>
          <div style="background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.25); border-radius: var(--radius-md); padding: 12px;">
            <strong style="color: #f43f5e; font-size: 13px; display: block; margin-bottom: 4px;">⚠️ Типичные ошибки</strong>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${this.escapeHtml(inst.mistakes || 'Не допускайте рывков и потери контроля.')}</p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-primary btn-block" id="btn-start-from-ex" data-ex-id="${this.escapeHtml(ex.id)}">
            ⚡ Начать тренировку с этого упражнения
          </button>
          <button class="btn btn-secondary btn-block btn-sm" id="btn-view-ex-history" data-ex-id="${this.escapeHtml(ex.id)}">
            Просмотреть полную историю упражнения
          </button>
        </div>
      `;

      modal.classList.remove('hidden');

      const btnStartFromEx = document.getElementById('btn-start-from-ex');
      if (btnStartFromEx) {
        btnStartFromEx.addEventListener('click', () => {
          modal.classList.add('hidden');
          this.startWorkoutFromExercise(exId);
        });
      }

      const btnViewHist = document.getElementById('btn-view-ex-history');
      if (btnViewHist) {
        btnViewHist.addEventListener('click', () => {
          modal.classList.add('hidden');
          this.openExerciseHistoryModal(exId);
        });
      }
    },

    openExerciseHistoryModal: function (exId) {
      const ex = window.BentoStorage.getExerciseById(exId);
      if (!ex) return;

      const modal = document.getElementById('exercise-history-modal');
      const title = document.getElementById('ex-history-modal-title');
      const body = document.getElementById('ex-history-modal-body');

      title.textContent = `История: ${ex.name}`;
      const historyList = window.BentoStorage.getExerciseHistoryList(exId);
      const unit = window.BentoStorage.getSettings().unit || 'kg';

      if (historyList.length === 0) {
        body.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
            В дневнике пока нет выполненных подходов для этого упражнения.
          </div>
        `;
      } else {
        body.innerHTML = historyList.map((item) => {
          const dStr = new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
          const setsRows = item.sets.map((s, idx) => `
            <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-bottom: 1px dashed var(--border-subtle);">
              <span>Сет ${idx + 1}</span>
              <strong>${this.escapeHtml(window.BentoStorage.convertWeight(s.weight, unit))} ${this.escapeHtml(unit)} × ${this.escapeHtml(s.reps)} повт</strong>
            </div>
          `).join('');

          return `
            <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 14px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="color: var(--accent); font-size: 14px;">${this.escapeHtml(item.workoutTitle)}</strong>
                <span style="font-size: 11px; color: var(--text-tertiary);">${dStr}</span>
              </div>
              <div style="display: flex; flex-direction: column;">
                ${setsRows}
              </div>
            </div>
          `;
        }).join('');
      }

      modal.classList.remove('hidden');
    },

    openCustomExerciseModal: function () {
      document.getElementById('custom-ex-name').value = '';
      document.getElementById('custom-ex-muscles').value = '';
      document.getElementById('custom-ex-technique').value = '';
      document.getElementById('custom-exercise-modal').classList.remove('hidden');
    },

    saveCustomExercise: function () {
      const name = document.getElementById('custom-ex-name').value.trim();
      const cat = document.getElementById('custom-ex-category').value;
      const musclesStr = document.getElementById('custom-ex-muscles').value.trim();
      const tech = document.getElementById('custom-ex-technique').value.trim();

      if (!name) {
        alert('Пожалуйста, введите название упражнения.');
        return;
      }

      const muscles = musclesStr ? musclesStr.split(',').map((s) => s.trim()) : [];
      const catNames = { chest: 'Грудь', back: 'Спина', legs: 'Ноги', shoulders: 'Плечи', arms: 'Руки', core: 'Кор' };

      const newEx = {
        id: 'custom_' + Date.now(),
        name: name,
        nameEn: name,
        category: cat,
        categoryName: catNames[cat] || cat,
        targetMuscles: muscles.length > 0 ? muscles : [catNames[cat]],
        isCustom: true,
        svgIcon: `<svg viewBox="0 0 100 100" class="ex-svg"><circle cx="50" cy="50" r="30" fill="var(--accent-subtle)" stroke="var(--accent)" stroke-width="4"/><circle cx="50" cy="50" r="10" fill="var(--accent)"/></svg>`,
        instructions: {
          initial: tech || 'Исходное положение согласно технике упражнения.',
          eccentric: 'Подконтрольная негативная фаза.',
          concentric: 'Мощная позитивная фаза.',
          breathing: 'Вдох на расслаблении, выдох на усилии.',
          mistakes: 'Соблюдайте безопасность суставов и связок.',
        },
      };

      if (!window.BentoStorage.saveExercise(newEx)) {
        alert('Не удалось сохранить упражнение. Проверьте доступность хранилища устройства.');
        return;
      }
      document.getElementById('custom-exercise-modal').classList.add('hidden');
      this.renderExercises();
      this.showToast(`Упражнение "${name}" сохранено`);
    },

    // ----------------------------------------------------
    // 4. ACTIVE WORKOUT TRACKER ENGINE
    // ----------------------------------------------------
    startWorkoutFromTemplate: function (templateId) {
      const tpl = window.BentoStorage.getTemplateById(templateId);
      if (!tpl) return;

      const exercises = tpl.exercises.map((item) => {
        const exObj = window.BentoStorage.getExerciseById(item.exerciseId);
        const lastPerf = window.BentoStorage.getLastPerformanceForExercise(item.exerciseId);

        const setsCount = item.targetSets || 3;
        const sets = [];
        for (let i = 1; i <= setsCount; i++) {
          let initWeight = item.targetWeight || 0;
          let initReps = item.targetReps || 10;
          if (lastPerf && lastPerf.allCompletedSets && lastPerf.allCompletedSets[i - 1]) {
            initWeight = lastPerf.allCompletedSets[i - 1].weight;
            initReps = lastPerf.allCompletedSets[i - 1].reps;
          } else if (lastPerf && lastPerf.lastSet) {
            initWeight = lastPerf.lastSet.weight;
            initReps = lastPerf.lastSet.reps;
          }

          sets.push({
            id: 's_' + Date.now() + '_' + i,
            setNumber: i,
            weight: initWeight,
            reps: initReps,
            completed: false,
          });
        }

        return {
          exerciseId: item.exerciseId,
          name: exObj ? exObj.name : 'Упражнение',
          category: exObj ? exObj.category : 'chest',
          progressionWeight: item.progressionWeight || '',
          progressionReps: item.progressionReps || '',
          sets: sets,
        };
      });

      this.createActiveSession(tpl.name, tpl.id, exercises);
    },

    startFreeWorkout: function () {
      this.createActiveSession('Свободная тренировка', null, []);
    },

    startWorkoutFromExercise: function (exerciseId) {
      const exObj = window.BentoStorage.getExerciseById(exerciseId);
      const lastPerf = window.BentoStorage.getLastPerformanceForExercise(exerciseId);
      const sets = [
        {
          id: 's_' + Date.now() + '_1',
          setNumber: 1,
          weight: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.weight : 50,
          reps: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.reps : 10,
          completed: false,
        },
        {
          id: 's_' + Date.now() + '_2',
          setNumber: 2,
          weight: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.weight : 50,
          reps: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.reps : 10,
          completed: false,
        },
        {
          id: 's_' + Date.now() + '_3',
          setNumber: 3,
          weight: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.weight : 50,
          reps: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.reps : 10,
          completed: false,
        },
      ];

      const exItem = {
        exerciseId: exerciseId,
        name: exObj ? exObj.name : 'Упражнение',
        category: exObj ? exObj.category : 'chest',
        progressionWeight: '+2.5 кг',
        progressionReps: 'до 12 повт',
        sets: sets,
      };

      this.createActiveSession(`Тренировка: ${exObj ? exObj.name : ''}`, null, [exItem]);
    },

    createActiveSession: function (title, templateId, exercises) {
      if (AppState.activeWorkout) {
        this.openActiveWorkoutScreen();
        this.showToast('Сначала завершите или отмените текущую тренировку', 'info');
        return false;
      }

      const newWorkout = {
        id: 'active_' + Date.now(),
        title: title || 'Силовая тренировка',
        templateId: templateId || null,
        startTime: Date.now(),
        elapsedSeconds: 0,
        exercises: exercises || [],
      };
      if (!window.BentoStorage.saveActiveWorkout(newWorkout)) {
        alert('Не удалось сохранить новую тренировку. Проверьте доступность хранилища устройства.');
        return false;
      }
      AppState.activeWorkout = newWorkout;
      this.resumeActiveWorkoutTimer();
      this.openActiveWorkoutScreen();
      this.renderHomeBento();
      this.showToast('Тренировка начата! 🏋️');
      return true;
    },

    resumeActiveWorkoutTimer: function () {
      clearInterval(AppState.workoutTimerInterval);
      if (!AppState.activeWorkout) return;

      const baseStart = AppState.activeWorkout.startTime || Date.now();
      AppState.workoutTimerInterval = setInterval(() => {
        if (!AppState.activeWorkout) return;
        const now = Date.now();
        AppState.activeWorkout.elapsedSeconds = Math.floor((now - baseStart) / 1000);

        const ticker = document.getElementById('workout-duration-ticker');
        if (ticker) {
          ticker.textContent = this.formatDuration(AppState.activeWorkout.elapsedSeconds);
        }

        const homeActiveDuration = document.getElementById('home-active-duration');
        if (homeActiveDuration) {
          homeActiveDuration.textContent = this.formatDuration(AppState.activeWorkout.elapsedSeconds);
        }
      }, 1000);
    },

    openActiveWorkoutScreen: function () {
      const screen = document.getElementById('active-workout-screen');
      if (!screen || !AppState.activeWorkout) return;

      const titleInput = document.getElementById('workout-title-input');
      if (titleInput) {
        titleInput.value = AppState.activeWorkout.title;
      }

      this.renderActiveWorkoutSets();
      this.updateActiveWorkoutMetricsTicker();
      screen.classList.remove('hidden');
    },

    scrollToNextWorkoutExercise: function () {
      const container = document.getElementById('workout-exercises-container');
      if (!container) return;
      const cards = [...container.querySelectorAll('.workout-exercise-card')];
      const top = container.getBoundingClientRect().top + 48;
      const next = cards.find((card) => card.getBoundingClientRect().top > top);
      if (next) next.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    },

    minimizeActiveWorkoutScreen: function () {
      const screen = document.getElementById('active-workout-screen');
      if (screen) screen.classList.add('hidden');
      this.renderHomeBento();
    },

    updateActiveWorkoutMetricsTicker: function () {
      if (!AppState.activeWorkout) return;

      const totalSets = this.countTotalSets(AppState.activeWorkout);
      const compSets = this.countCompletedSets(AppState.activeWorkout);
      const exCount = AppState.activeWorkout.exercises ? AppState.activeWorkout.exercises.length : 0;

      const setsTicker = document.getElementById('workout-sets-ticker');
      if (setsTicker) setsTicker.textContent = `${compSets} / ${totalSets}`;

      const exTicker = document.getElementById('workout-exercises-ticker');
      if (exTicker) exTicker.textContent = `${exCount}`;
    },

    renderActiveWorkoutSets: function () {
      const container = document.getElementById('workout-exercises-container');
      if (!container || !AppState.activeWorkout) return;

      const settings = window.BentoStorage.getSettings();
      const unit = settings.unit || 'kg';
      const nextExerciseButton = document.getElementById('btn-workout-next-exercise');
      if (nextExerciseButton) nextExerciseButton.hidden = AppState.activeWorkout.exercises.length < 2;

      if (AppState.activeWorkout.exercises.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 60px 20px; color: var(--text-tertiary);">
            <div style="font-size: 40px; margin-bottom: 12px;">🏋️</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">В тренировке пока нет упражнений</div>
            <p style="font-size: 13px; margin-bottom: 18px;">Нажмите кнопку ниже, чтобы выбрать упражнения из библиотеки.</p>
            <button class="btn btn-primary" id="btn-empty-add-exercise">+ Добавить первое упражнение</button>
          </div>
        `;
        const btnEmptyAdd = document.getElementById('btn-empty-add-exercise');
        if (btnEmptyAdd) {
          btnEmptyAdd.addEventListener('click', () => this.openExercisePickerModal());
        }
        return;
      }

      container.innerHTML = AppState.activeWorkout.exercises.map((exItem, exIdx) => {
        const lastPerf = window.BentoStorage.getLastPerformanceForExercise(exItem.exerciseId);

        const setRows = exItem.sets.map((s, sIdx) => {
          let prevSetHint = '—';
          if (lastPerf && lastPerf.allCompletedSets && lastPerf.allCompletedSets[sIdx]) {
            const p = lastPerf.allCompletedSets[sIdx];
            prevSetHint = `${window.BentoStorage.convertWeight(p.weight, unit)}×${p.reps}`;
          } else if (lastPerf && lastPerf.lastSet) {
            prevSetHint = `${window.BentoStorage.convertWeight(lastPerf.lastSet.weight, unit)}×${lastPerf.lastSet.reps}`;
          }

          let targetHint = '—';
          if (exItem.progressionWeight || exItem.progressionReps) {
            targetHint = `${exItem.progressionWeight || ''} ${exItem.progressionReps || ''}`.trim();
          }

          return `
            <tr class="set-row ${s.completed ? 'is-done' : ''}" data-ex-idx="${exIdx}" data-set-idx="${sIdx}">
              <td>
                <span class="set-num-badge">${this.escapeHtml(s.setNumber)}</span>
              </td>
              <td>
                <div class="set-prev-hint">${this.escapeHtml(prevSetHint)}</div>
              </td>
              <td>
                <div class="set-target-hint">${this.escapeHtml(targetHint)}</div>
              </td>
              <td>
                <input type="number" step="0.5" class="set-input-box set-weight-input" value="${this.escapeHtml(window.BentoStorage.convertWeight(s.weight, unit))}" data-ex-idx="${exIdx}" data-set-idx="${sIdx}">
              </td>
              <td>
                <input type="number" step="1" class="set-input-box set-reps-input" value="${this.escapeHtml(s.reps)}" data-ex-idx="${exIdx}" data-set-idx="${sIdx}">
              </td>
              <td>
                <button class="set-check-btn ${s.completed ? 'checked' : ''}" data-ex-idx="${exIdx}" data-set-idx="${sIdx}" title="Отметить подход">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              </td>
            </tr>
          `;
        }).join('');

        return `
          <div class="workout-exercise-card" data-ex-idx="${exIdx}">
            <div class="workout-exercise-header">
              <div>
                <span class="category-tag" style="margin-bottom: 4px;">${this.escapeHtml(exItem.category || 'Грудь')}</span>
                <div class="workout-exercise-title">${this.escapeHtml(exItem.name)}</div>
              </div>
              <div class="workout-exercise-actions">
                <button class="icon-btn btn-sm btn-ex-tech" data-ex-id="${this.escapeHtml(exItem.exerciseId)}" title="Техника упражнения">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </button>
                <button class="icon-btn btn-sm btn-ex-hist" data-ex-id="${this.escapeHtml(exItem.exerciseId)}" title="История подходов">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </button>
                <button class="icon-btn btn-sm btn-ex-remove" data-ex-idx="${exIdx}" title="Удалить из тренировки" style="color: #f43f5e;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <table class="set-table">
              <thead>
                <tr>
                  <th>Сет</th>
                  <th>Прошлый</th>
                  <th>Цель</th>
                  <th>${this.escapeHtml(unit)}</th>
                  <th>Повт</th>
                  <th>✓</th>
                </tr>
              </thead>
              <tbody>
                ${setRows}
              </tbody>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
              <button class="btn btn-secondary btn-sm btn-add-set" data-ex-idx="${exIdx}">
                + Добавить подход
              </button>
              ${exItem.sets.length > 1 ? `
                <button class="btn btn-sm" style="color: var(--text-tertiary); background:none; border:none;" data-ex-idx="${exIdx}" id="btn-remove-last-set-${exIdx}">
                  - Убрать последний
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.set-weight-input').forEach((input) => {
        input.addEventListener('input', (e) => {
          const exIdx = parseInt(e.target.getAttribute('data-ex-idx'));
          const sIdx = parseInt(e.target.getAttribute('data-set-idx'));
          const val = parseFloat(e.target.value) || 0;
          AppState.activeWorkout.exercises[exIdx].sets[sIdx].weight = window.BentoStorage.toKg(val, unit);
          this.persistActiveWorkout();
          this.updateActiveWorkoutMetricsTicker();
        });
      });

      container.querySelectorAll('.set-reps-input').forEach((input) => {
        input.addEventListener('input', (e) => {
          const exIdx = parseInt(e.target.getAttribute('data-ex-idx'));
          const sIdx = parseInt(e.target.getAttribute('data-set-idx'));
          const val = parseInt(e.target.value) || 0;
          AppState.activeWorkout.exercises[exIdx].sets[sIdx].reps = val;
          this.persistActiveWorkout();
          this.updateActiveWorkoutMetricsTicker();
        });
      });

      container.querySelectorAll('.set-check-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const exIdx = parseInt(btn.getAttribute('data-ex-idx'));
          const sIdx = parseInt(btn.getAttribute('data-set-idx'));
          const currentStatus = AppState.activeWorkout.exercises[exIdx].sets[sIdx].completed;
          const newStatus = !currentStatus;

          AppState.activeWorkout.exercises[exIdx].sets[sIdx].completed = newStatus;
          this.persistActiveWorkout();

          btn.classList.toggle('checked', newStatus);
          const row = btn.closest('.set-row');
          if (row) row.classList.toggle('is-done', newStatus);

          this.updateActiveWorkoutMetricsTicker();

          if (newStatus) {
            window.BentoFeedback.playSetCompleteClick();
            window.BentoFeedback.hapticSetCheck();

            const settings = window.BentoStorage.getSettings();
            window.BentoTimer.start(settings.defaultRestSeconds || 90);
          }
        });
      });

      container.querySelectorAll('.btn-add-set').forEach((btn) => {
        btn.addEventListener('click', () => {
          const exIdx = parseInt(btn.getAttribute('data-ex-idx'));
          const setsArr = AppState.activeWorkout.exercises[exIdx].sets;
          const prevSet = setsArr[setsArr.length - 1];

          setsArr.push({
            id: 's_' + Date.now() + '_' + (setsArr.length + 1),
            setNumber: setsArr.length + 1,
            weight: prevSet ? prevSet.weight : 50,
            reps: prevSet ? prevSet.reps : 10,
            completed: false,
          });

          this.persistActiveWorkout();
          this.renderActiveWorkoutSets();
          this.updateActiveWorkoutMetricsTicker();
        });
      });

      AppState.activeWorkout.exercises.forEach((ex, exIdx) => {
        const btnRemove = document.getElementById(`btn-remove-last-set-${exIdx}`);
        if (btnRemove) {
          btnRemove.addEventListener('click', () => {
            if (ex.sets.length > 1) {
              ex.sets.pop();
              this.persistActiveWorkout();
              this.renderActiveWorkoutSets();
              this.updateActiveWorkoutMetricsTicker();
            }
          });
        }
      });

      container.querySelectorAll('.btn-ex-tech').forEach((btn) => {
        btn.addEventListener('click', () => {
          const exId = btn.getAttribute('data-ex-id');
          this.openExerciseDetailModal(exId);
        });
      });

      container.querySelectorAll('.btn-ex-hist').forEach((btn) => {
        btn.addEventListener('click', () => {
          const exId = btn.getAttribute('data-ex-id');
          this.openExerciseHistoryModal(exId);
        });
      });

      container.querySelectorAll('.btn-ex-remove').forEach((btn) => {
        btn.addEventListener('click', () => {
          const exIdx = parseInt(btn.getAttribute('data-ex-idx'));
          if (confirm('Удалить это упражнение из тренировки?')) {
            AppState.activeWorkout.exercises.splice(exIdx, 1);
            this.persistActiveWorkout();
            this.renderActiveWorkoutSets();
            this.updateActiveWorkoutMetricsTicker();
          }
        });
      });
    },

    bindActiveWorkout: function () {
      const titleInput = document.getElementById('workout-title-input');
      if (titleInput) {
        titleInput.addEventListener('input', (e) => {
          if (AppState.activeWorkout) {
            AppState.activeWorkout.title = e.target.value;
            this.persistActiveWorkout();
          }
        });
      }

      const btnMinimize = document.getElementById('btn-minimize-workout');
      if (btnMinimize) {
        btnMinimize.addEventListener('click', () => this.minimizeActiveWorkoutScreen());
      }

      const btnFinish = document.getElementById('btn-finish-workout');
      if (btnFinish) {
        btnFinish.addEventListener('click', () => this.openFinishConfirmationModal());
      }

      const btnAddEx = document.getElementById('btn-workout-add-exercise');
      if (btnAddEx) {
        btnAddEx.addEventListener('click', () => this.openExercisePickerModal());
      }
      const btnNextEx = document.getElementById('btn-workout-next-exercise');
      if (btnNextEx) btnNextEx.addEventListener('click', () => this.scrollToNextWorkoutExercise());

      const btnCancel = document.getElementById('btn-workout-cancel');
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          if (confirm('Прервать и сбросить текущую тренировку? Все несохраненные данные будут удалены.')) {
            this.discardActiveWorkout();
          }
        });
      }

      const btnCloseFinish = document.getElementById('btn-close-finish-dialog');
      if (btnCloseFinish) {
        btnCloseFinish.addEventListener('click', () => {
          document.getElementById('workout-finish-modal').classList.add('hidden');
        });
      }
      const btnCancelFinish = document.getElementById('btn-finish-cancel');
      if (btnCancelFinish) {
        btnCancelFinish.addEventListener('click', () => {
          document.getElementById('workout-finish-modal').classList.add('hidden');
        });
      }
      const btnConfirmFinish = document.getElementById('btn-finish-confirm');
      if (btnConfirmFinish) {
        btnConfirmFinish.addEventListener('click', () => this.commitFinishWorkout());
      }

      const btnClosePicker = document.getElementById('btn-close-exercise-picker');
      if (btnClosePicker) {
        btnClosePicker.addEventListener('click', () => {
          this.closeExercisePickerModal();
        });
      }
      const pickerSearch = document.getElementById('picker-search-input');
      if (pickerSearch) {
        pickerSearch.addEventListener('input', (e) => {
          this.renderExercisePickerList(e.target.value);
        });
      }
    },

    openExercisePickerModal: function () {
      AppState.exercisePickerTarget = 'workout';
      this.showExercisePickerModal();
    },

    showExercisePickerModal: function () {
      const modal = document.getElementById('picker-exercise-modal');
      const search = document.getElementById('picker-search-input');
      if (search) search.value = '';
      this.renderExercisePickerList('');
      modal.classList.remove('hidden');
    },

    closeExercisePickerModal: function () {
      document.getElementById('picker-exercise-modal').classList.add('hidden');
      if (AppState.exercisePickerTarget === 'template') {
        document.getElementById('template-editor-modal').classList.remove('hidden');
      }
    },

    renderExercisePickerList: function (queryStr) {
      const container = document.getElementById('picker-exercises-list');
      if (!container) return;

      const exercises = window.BentoStorage.getExercises();
      const q = (queryStr || '').toLowerCase().trim();

      const filtered = exercises.filter((e) => {
        return !q || e.name.toLowerCase().includes(q) || (e.categoryName && e.categoryName.toLowerCase().includes(q));
      });

      container.innerHTML = filtered.map((ex) => {
        return `
          <div class="catalog-item-card picker-item" data-ex-id="${this.escapeHtml(ex.id)}">
            <div class="catalog-item-svg">
              ${this.sanitizeSvgMarkup(ex.svgIcon)}
            </div>
            <div class="catalog-item-info">
              <div class="catalog-item-name">${this.escapeHtml(ex.name)}</div>
              <div class="catalog-item-meta">
                <span class="category-tag">${this.escapeHtml(ex.categoryName || ex.category)}</span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" style="flex-shrink:0;">+ Добавить</button>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.picker-item').forEach((card) => {
        card.addEventListener('click', () => {
          const exId = card.getAttribute('data-ex-id');
          if (AppState.exercisePickerTarget === 'template') {
            if (!window._tplEditingExercises) window._tplEditingExercises = [];
            window._tplEditingExercises.push({
              exerciseId: exId,
              targetSets: 3,
              targetWeight: 40,
              targetReps: 10,
              progressionWeight: '+2.5 кг',
              progressionReps: 'до 12 повт',
            });
            this.renderTemplateEditorExercises(window._tplEditingExercises);
          } else {
            this.addExerciseToActiveWorkout(exId);
          }
          this.closeExercisePickerModal();
        });
      });
    },

    addExerciseToActiveWorkout: function (exId) {
      if (!AppState.activeWorkout) return;
      const exObj = window.BentoStorage.getExerciseById(exId);
      const lastPerf = window.BentoStorage.getLastPerformanceForExercise(exId);

      const defaultWeight = lastPerf && lastPerf.lastSet ? lastPerf.lastSet.weight : 40;
      const defaultReps = lastPerf && lastPerf.lastSet ? lastPerf.lastSet.reps : 10;

      const newExItem = {
        exerciseId: exId,
        name: exObj ? exObj.name : 'Упражнение',
        category: exObj ? exObj.category : 'chest',
        progressionWeight: '+2.5 кг',
        progressionReps: 'до 10 повт',
        sets: [
          { id: 's_' + Date.now() + '_1', setNumber: 1, weight: defaultWeight, reps: defaultReps, completed: false },
          { id: 's_' + Date.now() + '_2', setNumber: 2, weight: defaultWeight, reps: defaultReps, completed: false },
          { id: 's_' + Date.now() + '_3', setNumber: 3, weight: defaultWeight, reps: defaultReps, completed: false },
        ],
      };

      AppState.activeWorkout.exercises.push(newExItem);
      this.persistActiveWorkout();
      this.renderActiveWorkoutSets();
      this.updateActiveWorkoutMetricsTicker();
      this.showToast(`Добавлено: ${newExItem.name}`);
    },

    openFinishConfirmationModal: function () {
      if (!AppState.activeWorkout) return;

      const durStr = this.formatDuration(AppState.activeWorkout.elapsedSeconds || 0);
      const compSets = this.countCompletedSets(AppState.activeWorkout);
      const totalSets = this.countTotalSets(AppState.activeWorkout);
      const exCount = AppState.activeWorkout.exercises ? AppState.activeWorkout.exercises.length : 0;

      document.getElementById('finish-modal-duration').textContent = durStr;
      document.getElementById('finish-modal-sets').textContent = `${compSets} из ${totalSets}`;
      document.getElementById('finish-modal-exercises').textContent = `${exCount}`;

      document.getElementById('workout-finish-modal').classList.remove('hidden');
    },

    commitFinishWorkout: function () {
      if (!AppState.activeWorkout) return;

      const compSets = this.countCompletedSets(AppState.activeWorkout);
      const totalSets = this.countTotalSets(AppState.activeWorkout);

      const workoutRecord = {
        id: 'hist_' + String(AppState.activeWorkout.id || Date.now()).replace(/^active_/, ''),
        title: AppState.activeWorkout.title || 'Силовая тренировка',
        templateId: AppState.activeWorkout.templateId,
        date: new Date().toISOString(),
        durationSeconds: AppState.activeWorkout.elapsedSeconds || 0,
        totalSets: totalSets,
        completedSets: compSets,
        exercises: JSON.parse(JSON.stringify(AppState.activeWorkout.exercises)),
      };

      if (!window.BentoStorage.addWorkoutToHistory(workoutRecord)) {
        alert('Не удалось сохранить тренировку в историю. Активная тренировка оставлена без изменений.');
        this.showToast('Ошибка сохранения тренировки', 'error');
        return;
      }
      if (!this.discardActiveWorkout()) {
        alert('Тренировка сохранена в историю, но активную сессию не удалось очистить. Повторное сохранение не создаст дубликат.');
        return;
      }

      document.getElementById('workout-finish-modal').classList.add('hidden');
      this.minimizeActiveWorkoutScreen();
      this.renderHomeBento();
      this.renderAnalytics();

      this.showToast('🎉 Тренировка успешно сохранена в дневник!');
    },

    persistActiveWorkout: function () {
      if (!AppState.activeWorkout) return false;
      const saved = window.BentoStorage.saveActiveWorkout(AppState.activeWorkout);
      if (!saved) {
        this.showToast('Не удалось сохранить изменения тренировки', 'error');
      }
      return saved;
    },

    discardActiveWorkout: function () {
      if (!window.BentoStorage.clearActiveWorkout()) {
        this.showToast('Не удалось очистить активную тренировку', 'error');
        return false;
      }
      clearInterval(AppState.workoutTimerInterval);
      AppState.activeWorkout = null;
      window.BentoTimer.stop();
      this.minimizeActiveWorkoutScreen();
      this.renderHomeBento();
      return true;
    },

    countTotalSets: function (workout) {
      if (!workout || !workout.exercises) return 0;
      return workout.exercises.reduce((sum, ex) => sum + (ex.sets ? ex.sets.length : 0), 0);
    },

    countCompletedSets: function (workout) {
      if (!workout || !workout.exercises) return 0;
      return workout.exercises.reduce((sum, ex) => {
        if (!ex.sets) return sum;
        return sum + ex.sets.filter((s) => s.completed).length;
      }, 0);
    },

    formatDuration: function (totalSec) {
      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      if (hrs > 0) {
        return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
      return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },

    // ----------------------------------------------------
    // 5. SMART REST TIMER BINDINGS
    // ----------------------------------------------------
    bindFloatingTimer: function () {
      const expandBtn = document.getElementById('btn-expand-timer');
      if (expandBtn) {
        expandBtn.addEventListener('click', () => {
          document.getElementById('rest-timer-modal').classList.remove('hidden');
        });
      }

      const btnCloseModal = document.getElementById('btn-close-rest-modal');
      if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
          document.getElementById('rest-timer-modal').classList.add('hidden');
        });
      }

      const pillAdd30 = document.getElementById('btn-pill-add-30');
      if (pillAdd30) {
        pillAdd30.addEventListener('click', (e) => {
          e.stopPropagation();
          window.BentoTimer.addSeconds(30);
          this.showToast('+30 секунд к отдыху');
        });
      }

      const pillSkip = document.getElementById('btn-pill-skip');
      if (pillSkip) {
        pillSkip.addEventListener('click', (e) => {
          e.stopPropagation();
          window.BentoTimer.stop();
        });
      }

      const modalAdd30 = document.getElementById('btn-modal-add-30');
      if (modalAdd30) {
        modalAdd30.addEventListener('click', () => {
          window.BentoTimer.addSeconds(30);
        });
      }

      const modalSub15 = document.getElementById('btn-modal-sub-15');
      if (modalSub15) {
        modalSub15.addEventListener('click', () => {
          window.BentoTimer.addSeconds(-15);
        });
      }

      const modalPauseToggle = document.getElementById('btn-modal-pause-toggle');
      if (modalPauseToggle) {
        modalPauseToggle.addEventListener('click', () => {
          window.BentoTimer.togglePause();
          modalPauseToggle.textContent = window.BentoTimer.isRunning() ? 'Пауза' : 'Старт';
        });
      }

      const modalSkip = document.getElementById('btn-modal-skip-rest');
      if (modalSkip) {
        modalSkip.addEventListener('click', () => {
          window.BentoTimer.stop();
          document.getElementById('rest-timer-modal').classList.add('hidden');
        });
      }
    },

    // ----------------------------------------------------
    // 6. ANALYTICS & CALENDAR RENDERER
    // ----------------------------------------------------
    renderAnalytics: function () {
      const calWrap = document.getElementById('analytics-calendar-wrap');
      if (calWrap) {
        calWrap.innerHTML = window.BentoAnalytics.renderCalendarHTML();

        const btnPrev = document.getElementById('cal-prev-btn');
        if (btnPrev) {
          btnPrev.addEventListener('click', () => {
            window.BentoAnalytics.setMonthOffset(-1);
            this.renderAnalytics();
          });
        }
        const btnNext = document.getElementById('cal-next-btn');
        if (btnNext) {
          btnNext.addEventListener('click', () => {
            window.BentoAnalytics.setMonthOffset(1);
            this.renderAnalytics();
          });
        }

        calWrap.querySelectorAll('.cal-day').forEach((btn) => {
          btn.addEventListener('click', () => {
            const dateStr = btn.getAttribute('data-date');
            if (!dateStr) return;
            window.BentoAnalytics.setSelectedDate(dateStr);
            this.renderAnalytics();
            this.renderDaySessions(dateStr);
          });
        });
      }

      // Stats Bento in Analytics
      const statsBento = document.getElementById('analytics-stats-bento');
      if (statsBento) {
        const stats = window.BentoAnalytics.getGlobalStats();

        statsBento.innerHTML = `
          <div class="bento-card bento-col-1">
            <span class="bento-card-tag">Тренировки</span>
            <div class="bento-stat-num">${stats.totalWorkouts}</div>
            <div class="bento-card-subtitle">Всего проведено</div>
          </div>
          <div class="bento-card bento-col-1">
            <span class="bento-card-tag">Подходы</span>
            <div class="bento-stat-num">${stats.totalCompletedSets}</div>
            <div class="bento-card-subtitle">Выполнено сетов</div>
          </div>
        `;
      }

      // Full History List
      const historyList = document.getElementById('analytics-history-list');
      if (historyList) {
        const history = window.BentoStorage.getHistory();

        if (history.length === 0) {
          historyList.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-tertiary);">Дневник пока пуст. Проведите первую тренировку!</div>`;
          return;
        }

        historyList.innerHTML = history.map((w) => {
          const dStr = new Date(w.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
          const durStr = this.formatDuration(w.durationSeconds || 0);
          const exCount = w.exercises ? w.exercises.length : 0;

          return `
            <div class="history-item-card" data-workout-id="${this.escapeHtml(w.id)}">
              <div class="history-card-top">
                <span class="history-card-title">${this.escapeHtml(w.title)}</span>
                <span class="history-card-date">${dStr}</span>
              </div>
              <div class="history-card-metrics">
                <span>Время: <strong>${durStr}</strong></span>
                <span>Подходы: <strong>${this.escapeHtml(w.completedSets || w.totalSets || 0)}</strong></span>
                <span>Упражнений: <strong>${exCount}</strong></span>
              </div>
            </div>
          `;
        }).join('');

        historyList.querySelectorAll('.history-item-card').forEach((card) => {
          card.addEventListener('click', () => {
            const wId = card.getAttribute('data-workout-id');
            this.openPastWorkoutModal(wId);
          });
        });
      }
    },

    renderDaySessions: function (dateStr) {
      const box = document.getElementById('calendar-day-details-box');
      if (!box) return;

      const sessions = window.BentoAnalytics.getWorkoutsForDate(dateStr);

      if (sessions.length === 0) {
        box.innerHTML = `
          <div style="background: var(--pill-bg); border-radius: var(--radius-md); padding: 12px; font-size: 13px; color: var(--text-secondary); text-align: center;">
            На выбранную дату (<strong>${dateStr}</strong>) тренировок не найдено.
          </div>
        `;
        return;
      }

      box.innerHTML = `
        <div style="margin-bottom: 8px; font-size: 13px; font-weight: 700; color: var(--accent);">
          Тренировки за ${dateStr}:
        </div>
        ${sessions.map((s) => `
          <div class="history-item-card" style="margin-bottom: 8px;" data-workout-id="${this.escapeHtml(s.id)}">
            <div class="history-card-top">
              <span class="history-card-title">${this.escapeHtml(s.title)}</span>
              <span class="history-card-date">${this.formatDuration(s.durationSeconds || 0)}</span>
            </div>
            <div class="history-card-metrics">
              <span>Подходы: <strong>${this.escapeHtml(s.completedSets || 0)}</strong></span>
              <span>Упражнений: <strong>${s.exercises ? s.exercises.length : 0}</strong></span>
            </div>
          </div>
        `).join('')}
      `;

      box.querySelectorAll('.history-item-card').forEach((card) => {
        card.addEventListener('click', () => {
          const wId = card.getAttribute('data-workout-id');
          this.openPastWorkoutModal(wId);
        });
      });
    },

    bindAnalyticsAndCalendar: function () {
      const btnCloseHistDetail = document.getElementById('btn-close-hist-detail');
      if (btnCloseHistDetail) {
        btnCloseHistDetail.addEventListener('click', () => {
          document.getElementById('workout-detail-modal').classList.add('hidden');
        });
      }
    },

    openPastWorkoutModal: function (workoutId) {
      const workout = window.BentoStorage.getWorkoutById(workoutId);
      if (!workout) return;

      const modal = document.getElementById('workout-detail-modal');
      const title = document.getElementById('hist-modal-title');
      const body = document.getElementById('hist-modal-body');

      const settings = window.BentoStorage.getSettings();
      const unit = settings.unit || 'kg';

      title.textContent = workout.title;
      const dStr = new Date(workout.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const durStr = this.formatDuration(workout.durationSeconds || 0);
      const exCount = workout.exercises ? workout.exercises.length : 0;

      let exBreakdown = '';
      if (workout.exercises && workout.exercises.length > 0) {
        exBreakdown = workout.exercises.map((ex) => {
          const setList = (ex.sets || []).map((s) => `
            <div style="display:flex; justify-content: space-between; font-size: 13px; padding: 3px 0;">
              <span>Сет ${this.escapeHtml(s.setNumber)}:</span>
              <strong>${this.escapeHtml(window.BentoStorage.convertWeight(s.weight, unit))} ${this.escapeHtml(unit)} × ${this.escapeHtml(s.reps)} повт ${s.completed ? '✓' : ''}</strong>
            </div>
          `).join('');

          return `
            <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: var(--text-primary); font-size: 15px;">${this.escapeHtml(ex.name)}</strong>
                <span class="category-tag">${this.escapeHtml(ex.category || 'Грудь')}</span>
              </div>
              <div style="display: flex; flex-direction: column;">
                ${setList}
              </div>
            </div>
          `;
        }).join('');
      }

      body.innerHTML = `
        <div style="margin-bottom: 14px;">
          <div style="font-size: 12px; color: var(--text-tertiary);">${dStr}</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: var(--pill-bg); border-radius: var(--radius-md); padding: 12px; text-align: center; margin-bottom: 18px;">
          <div>
            <div style="font-size: 11px; color: var(--text-tertiary); font-weight: 700;">ВРЕМЯ</div>
            <div style="font-size: 16px; font-weight: 800;">${durStr}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: var(--text-tertiary); font-weight: 700;">СЕТЫ</div>
            <div style="font-size: 16px; font-weight: 800;">${this.escapeHtml(workout.completedSets || 0)}/${this.escapeHtml(workout.totalSets || 0)}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: var(--text-tertiary); font-weight: 700;">УПРАЖНЕНИЙ</div>
            <div style="font-size: 16px; font-weight: 800;">${exCount}</div>
          </div>
        </div>

        <div class="section-header" style="margin-top: 0;">
          <h3 class="section-title" style="font-size: 15px;">Протокол упражнений</h3>
        </div>
        <div style="margin-bottom: 16px;">
          ${exBreakdown}
        </div>
      `;

      modal.classList.remove('hidden');
    },

    // ----------------------------------------------------
    // 7. PROFILE, BODY METRICS & SETTINGS
    // ----------------------------------------------------
    renderProfile: function () {
      const metrics = window.BentoStorage.getBodyMetrics();
      const settings = window.BentoStorage.getSettings();
      const unit = settings.unit || 'kg';

      let currentWeightKg = 0;
      let weightDisplay = '--';
      if (metrics.logs && metrics.logs.length > 0) {
        const lastLog = metrics.logs[metrics.logs.length - 1];
        currentWeightKg = lastLog.weight;
        const conv = window.BentoStorage.convertWeight(currentWeightKg, unit);
        weightDisplay = `${this.escapeHtml(conv)} <span class="bento-stat-unit">${this.escapeHtml(unit)}</span>`;
      }
      const weightEl = document.getElementById('profile-current-weight');
      if (weightEl) weightEl.innerHTML = weightDisplay;

      const heightCm = metrics.height || 178;
      const heightEl = document.getElementById('profile-height-val');
      if (heightEl) heightEl.textContent = `${heightCm} см`;

      const bmiEl = document.getElementById('profile-bmi-val');
      if (bmiEl) {
        if (currentWeightKg > 0 && heightCm > 0) {
          const hM = heightCm / 100;
          const bmi = Math.round((currentWeightKg / (hM * hM)) * 10) / 10;
          bmiEl.innerHTML = `${bmi} <span class="bento-stat-unit" style="font-size:12px;">ИМТ</span>`;
        } else {
          bmiEl.textContent = '--';
        }
      }

      const logsContainer = document.getElementById('profile-weight-history-list');
      if (logsContainer) {
        if (!metrics.logs || metrics.logs.length === 0) {
          logsContainer.innerHTML = `<div style="font-size: 12px; color: var(--text-tertiary); padding: 8px 0;">Нет записей замера веса</div>`;
        } else {
          const rev = [...metrics.logs].reverse();
          logsContainer.innerHTML = rev.map((l) => {
            const wVal = window.BentoStorage.convertWeight(l.weight, unit);
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border-subtle); font-size: 13px;">
                <span style="color: var(--text-secondary);">${this.escapeHtml(l.date)}</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <strong>${this.escapeHtml(wVal)} ${this.escapeHtml(unit)}</strong>
                  <button class="btn-del-weight-log" data-log-id="${this.escapeHtml(l.id)}" style="color: #f43f5e; background:none; border:none; cursor:pointer;" title="Удалить">✕</button>
                </div>
              </div>
            `;
          }).join('');

          logsContainer.querySelectorAll('.btn-del-weight-log').forEach((btn) => {
            btn.addEventListener('click', () => {
              const logId = btn.getAttribute('data-log-id');
              if (!window.BentoStorage.deleteWeightLog(logId)) {
                alert('Не удалось удалить замер. Проверьте доступность хранилища устройства.');
                return;
              }
              this.renderProfile();
              this.renderHomeBento();
            });
          });
        }
      }

      document.querySelectorAll('#settings-unit-control .segment-item').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-unit') === unit);
      });

      const weeklySlider = document.getElementById('settings-weekly-goal-slider');
      const weeklyDisplay = document.getElementById('settings-weekly-goal-display');
      if (weeklySlider && weeklyDisplay) {
        weeklySlider.value = settings.weeklyGoal || 3;
        weeklyDisplay.textContent = `${settings.weeklyGoal || 3} дн.`;
      }

      const restSlider = document.getElementById('settings-rest-timer-slider');
      const restDisplay = document.getElementById('settings-rest-timer-display');
      if (restSlider && restDisplay) {
        restSlider.value = settings.defaultRestSeconds || 90;
        restDisplay.textContent = `${settings.defaultRestSeconds || 90} сек`;
      }

      document.querySelectorAll('#settings-theme-control .segment-item').forEach((b) => {
        const active = b.getAttribute('data-theme') === settings.theme;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      document.querySelectorAll('#settings-style-control .segment-item').forEach((b) => {
        const active = b.getAttribute('data-style') === (settings.uiStyle || 'bento');
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      document.querySelectorAll('.accent-color-circle').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-accent') === settings.accent);
      });

      const soundToggle = document.getElementById('settings-sound-toggle');
      if (soundToggle) soundToggle.checked = !!settings.soundEnabled;

      const vibToggle = document.getElementById('settings-vibration-toggle');
      if (vibToggle) vibToggle.checked = !!settings.vibrationEnabled;
    },

    bindProfileAndSettings: function () {
      const btnAddWeight = document.getElementById('btn-add-weight-log');
      if (btnAddWeight) {
        btnAddWeight.addEventListener('click', () => this.openWeightModal());
      }
      const btnCloseWeight = document.getElementById('btn-close-weight-modal');
      if (btnCloseWeight) {
        btnCloseWeight.addEventListener('click', () => {
          document.getElementById('weight-log-modal').classList.add('hidden');
        });
      }
      const btnSaveWeight = document.getElementById('btn-save-weight-log');
      if (btnSaveWeight) {
        btnSaveWeight.addEventListener('click', () => this.saveWeightLog());
      }

      document.querySelectorAll('#settings-unit-control .segment-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          const u = btn.getAttribute('data-unit');
          window.BentoStorage.saveSettings({ unit: u });
          this.applySavedThemeAndAccent();
          this.renderProfile();
          this.renderHomeBento();
          this.renderAnalytics();
          this.showToast(`Единицы измерения: ${u.toUpperCase()}`);
        });
      });

      const weeklySlider = document.getElementById('settings-weekly-goal-slider');
      const weeklyDisplay = document.getElementById('settings-weekly-goal-display');
      if (weeklySlider && weeklyDisplay) {
        weeklySlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value);
          weeklyDisplay.textContent = `${val} дн.`;
        });
        weeklySlider.addEventListener('change', (e) => {
          const val = parseInt(e.target.value);
          window.BentoStorage.saveSettings({ weeklyGoal: val });
          this.renderHomeBento();
          this.renderAnalytics();
          this.showToast(`Цель: ${val} тренировок в неделю`);
        });
      }

      const restSlider = document.getElementById('settings-rest-timer-slider');
      const restDisplay = document.getElementById('settings-rest-timer-display');
      if (restSlider && restDisplay) {
        restSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value);
          restDisplay.textContent = `${val} сек`;
        });
        restSlider.addEventListener('change', (e) => {
          const val = parseInt(e.target.value);
          window.BentoStorage.saveSettings({ defaultRestSeconds: val });
          this.showToast(`Базовый отдых: ${val} сек`);
        });
      }

      document.querySelectorAll('#settings-style-control .segment-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          const style = btn.getAttribute('data-style');
          if (!window.BentoStorage.saveSettings({ uiStyle: style })) {
            this.showToast('Не удалось сохранить стиль интерфейса', 'error');
            return;
          }
          this.applySavedThemeAndAccent();
          this.renderProfile();
        });
      });

      document.querySelectorAll('#settings-theme-control .segment-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          const th = btn.getAttribute('data-theme');
          if (!window.BentoStorage.saveSettings({ theme: th })) {
            this.showToast('Не удалось сохранить тему', 'error');
            return;
          }
          this.applySavedThemeAndAccent();
          this.renderProfile();
          this.showToast(`Тема: ${th === 'dark' ? 'Тёмная' : th === 'light' ? 'Светлая' : 'Система'}`);
        });
      });

      document.querySelectorAll('.accent-color-circle').forEach((btn) => {
        btn.addEventListener('click', () => {
          const acc = btn.getAttribute('data-accent');
          this.setAccentColor(acc);
        });
      });

      const soundToggle = document.getElementById('settings-sound-toggle');
      if (soundToggle) {
        soundToggle.addEventListener('change', (e) => {
          window.BentoStorage.saveSettings({ soundEnabled: e.target.checked });
          this.showToast(e.target.checked ? 'Звук включен 🔔' : 'Звук отключен 🔕');
        });
      }

      const vibToggle = document.getElementById('settings-vibration-toggle');
      if (vibToggle) {
        vibToggle.addEventListener('change', (e) => {
          window.BentoStorage.saveSettings({ vibrationEnabled: e.target.checked });
          this.showToast(e.target.checked ? 'Вибрация включена 📳' : 'Вибрация отключена 📴');
        });
      }

      const btnExportAll = document.getElementById('btn-export-full-backup');
      if (btnExportAll) {
        btnExportAll.addEventListener('click', () => {
          const json = window.BentoStorage.exportAllData();
          this.downloadJsonFile(json, `bentofit_backup_${this.getDateStamp()}.json`);
          this.showToast('Полный архив резервной копии скачан!');
        });
      }

      const btnImportAll = document.getElementById('btn-import-full-backup');
      const inputImportAll = document.getElementById('input-import-backup-file');
      if (btnImportAll && inputImportAll) {
        btnImportAll.addEventListener('click', () => inputImportAll.click());
        inputImportAll.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            const res = window.BentoStorage.importAllData(evt.target.result);
            if (res.success) {
              this.applySavedThemeAndAccent();
              this.renderHomeBento();
              this.renderTemplates();
              this.renderExercises();
              this.renderAnalytics();
              this.renderProfile();
              this.showToast('Данные успешно восстановлены!');
            } else {
              alert('Ошибка восстановления: ' + res.error);
            }
          };
          reader.readAsText(file);
        });
      }

      const btnResetDemo = document.getElementById('btn-reset-demo-data');
      if (btnResetDemo) {
        btnResetDemo.addEventListener('click', () => {
          if (confirm('Сбросить все данные приложения? Все данные будут очищены.')) {
            if (window.BentoStorage.resetAppData()) {
              location.reload();
            } else {
              alert('Не удалось сбросить данные приложения.');
            }
          }
        });
      }
    },

    openWeightModal: function () {
      const metrics = window.BentoStorage.getBodyMetrics();
      const settings = window.BentoStorage.getSettings();
      const unit = settings.unit || 'kg';

      let lastWeight = 75.0;
      if (metrics.logs && metrics.logs.length > 0) {
        lastWeight = metrics.logs[metrics.logs.length - 1].weight;
      }
      const conv = window.BentoStorage.convertWeight(lastWeight, unit);

      document.getElementById('input-weight-val').value = conv;
      document.getElementById('input-height-val').value = metrics.height || 178;
      document.getElementById('input-weight-date').value = this.getDateStamp();
      document.getElementById('weight-log-modal').classList.remove('hidden');
    },

    saveWeightLog: function () {
      const wInput = document.getElementById('input-weight-val');
      const hInput = document.getElementById('input-height-val');
      const dInput = document.getElementById('input-weight-date');

      const val = parseFloat(wInput.value);
      const hVal = parseInt(hInput.value) || 178;
      const dVal = dInput.value || this.getDateStamp();

      if (!val || val <= 0) {
        alert('Пожалуйста, введите корректный вес.');
        return;
      }

      const settings = window.BentoStorage.getSettings();
      const unit = settings.unit || 'kg';
      const inKg = window.BentoStorage.toKg(val, unit);

      if (!window.BentoStorage.addWeightLog(inKg, dVal, hVal)) {
        alert('Не удалось сохранить замер. Проверьте доступность хранилища устройства.');
        return;
      }

      document.getElementById('weight-log-modal').classList.add('hidden');
      this.renderProfile();
      this.renderHomeBento();
      this.showToast('Замер успешно сохранен');
    },

    // ----------------------------------------------------
    // 8. TEMPLATE BUILDER MODAL
    // ----------------------------------------------------
    openTemplateEditorModal: function (templateId) {
      AppState.editingTemplateId = templateId;
      const modal = document.getElementById('template-editor-modal');
      const title = document.getElementById('tpl-editor-title');
      const nameInput = document.getElementById('tpl-edit-name');
      const descInput = document.getElementById('tpl-edit-desc');
      const btnDelete = document.getElementById('btn-delete-template');

      if (templateId) {
        const tpl = window.BentoStorage.getTemplateById(templateId);
        title.textContent = 'Редактирование программы';
        nameInput.value = tpl ? tpl.name : '';
        descInput.value = tpl ? tpl.description || '' : '';
        btnDelete.style.display = 'block';
        this.renderTemplateEditorExercises(tpl ? tpl.exercises : []);
      } else {
        title.textContent = 'Создание новой программы';
        nameInput.value = '';
        descInput.value = '';
        btnDelete.style.display = 'none';
        this.renderTemplateEditorExercises([]);
      }

      modal.classList.remove('hidden');

      const btnAddEx = document.getElementById('btn-tpl-add-exercise');
      if (btnAddEx) {
        btnAddEx.onclick = () => {
          this.openExercisePickerModalForTemplate();
        };
      }
    },

    closeTemplateEditorModal: function () {
      document.getElementById('template-editor-modal').classList.add('hidden');
    },

    renderTemplateEditorExercises: function (exList) {
      const container = document.getElementById('tpl-edit-exercises-list');
      if (!container) return;
      window._tplEditingExercises = JSON.parse(JSON.stringify(exList || []));

      if (window._tplEditingExercises.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 20px; font-size: 13px; color: var(--text-tertiary); background: var(--pill-bg); border-radius: var(--radius-md);">
            В программе пока нет упражнений. Нажмите кнопку "+ Добавить".
          </div>
        `;
        return;
      }

      const settings = window.BentoStorage.getSettings();
      const unit = settings.unit || 'kg';

      container.innerHTML = window._tplEditingExercises.map((e, idx) => {
        const exObj = window.BentoStorage.getExerciseById(e.exerciseId);
        return `
          <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 14px; color: var(--text-primary);">${this.escapeHtml(exObj ? exObj.name : 'Упражнение')}</strong>
              <button class="icon-btn btn-sm btn-tpl-del-ex" data-idx="${idx}" style="color: #f43f5e; width: 28px; height: 28px;">✕</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 6px;">
              <div>
                <label style="font-size: 10px; color: var(--text-tertiary); font-weight:700;">СЕТЫ (1-20)</label>
                <input type="number" min="1" max="20" class="search-input tpl-inp-sets" data-idx="${idx}" value="${this.escapeHtml(e.targetSets || 3)}" style="padding: 6px; font-size: 13px; text-align:center;">
              </div>
              <div>
                <label style="font-size: 10px; color: var(--text-tertiary); font-weight:700;">ВЕС (${this.escapeHtml(unit)})</label>
                <input type="number" step="0.5" class="search-input tpl-inp-weight" data-idx="${idx}" value="${this.escapeHtml(window.BentoStorage.convertWeight(e.targetWeight ?? 50, unit))}" style="padding: 6px; font-size: 13px; text-align:center;">
              </div>
              <div>
                <label style="font-size: 10px; color: var(--text-tertiary); font-weight:700;">ПОВТОРЫ</label>
                <input type="number" class="search-input tpl-inp-reps" data-idx="${idx}" value="${this.escapeHtml(e.targetReps || 10)}" style="padding: 6px; font-size: 13px; text-align:center;">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="font-size: 10px; color: var(--text-tertiary); font-weight:700;">ПРОГРЕССИЯ ВЕСА</label>
                <input type="text" class="search-input tpl-inp-prog-w" data-idx="${idx}" value="${this.escapeHtml(e.progressionWeight || '+2.5 кг')}" style="padding: 6px; font-size: 12px;">
              </div>
              <div>
                <label style="font-size: 10px; color: var(--text-tertiary); font-weight:700;">ПРОГРЕССИЯ ПОВТОРОВ</label>
                <input type="text" class="search-input tpl-inp-prog-r" data-idx="${idx}" value="${this.escapeHtml(e.progressionReps || 'до 12 повт')}" style="padding: 6px; font-size: 12px;">
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.tpl-inp-sets').forEach((inp) => {
        inp.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          window._tplEditingExercises[idx].targetSets = parseInt(e.target.value) || 3;
        });
      });
      container.querySelectorAll('.tpl-inp-weight').forEach((inp) => {
        inp.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          window._tplEditingExercises[idx].targetWeight = window.BentoStorage.toKg(parseFloat(e.target.value) || 0, unit);
        });
      });
      container.querySelectorAll('.tpl-inp-reps').forEach((inp) => {
        inp.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          window._tplEditingExercises[idx].targetReps = parseInt(e.target.value) || 10;
        });
      });
      container.querySelectorAll('.tpl-inp-prog-w').forEach((inp) => {
        inp.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          window._tplEditingExercises[idx].progressionWeight = e.target.value;
        });
      });
      container.querySelectorAll('.tpl-inp-prog-r').forEach((inp) => {
        inp.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          window._tplEditingExercises[idx].progressionReps = e.target.value;
        });
      });
      container.querySelectorAll('.btn-tpl-del-ex').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          window._tplEditingExercises.splice(idx, 1);
          this.renderTemplateEditorExercises(window._tplEditingExercises);
        });
      });
    },

    openExercisePickerModalForTemplate: function () {
      AppState.exercisePickerTarget = 'template';
      document.getElementById('template-editor-modal').classList.add('hidden');
      this.showExercisePickerModal();
    },

    saveTemplateFromEditor: function () {
      const name = document.getElementById('tpl-edit-name').value.trim();
      const desc = document.getElementById('tpl-edit-desc').value.trim();

      if (!name) {
        alert('Пожалуйста, введите название шаблона программы.');
        return;
      }
      if (!window._tplEditingExercises || window._tplEditingExercises.length === 0) {
        alert('Добавьте хотя бы одно упражнение в программу.');
        return;
      }

      const id = AppState.editingTemplateId || ('tpl_' + Date.now());
      const tpl = {
        id: id,
        name: name,
        description: desc,
        exercises: window._tplEditingExercises,
      };

      if (!window.BentoStorage.saveTemplate(tpl)) {
        alert('Не удалось сохранить программу. Проверьте доступность хранилища устройства.');
        return;
      }
      this.closeTemplateEditorModal();
      this.renderTemplates();
      this.renderHomeBento();
      this.showToast(`Программа "${name}" сохранена!`);
    },

    deleteTemplateFromEditor: function () {
      if (!AppState.editingTemplateId) return;
      if (confirm('Вы уверены, что хотите удалить эту программу?')) {
        if (!window.BentoStorage.deleteTemplate(AppState.editingTemplateId)) {
          alert('Не удалось удалить программу. Проверьте доступность хранилища устройства.');
          return;
        }
        this.closeTemplateEditorModal();
        this.renderTemplates();
        this.renderHomeBento();
        this.showToast('Программа удалена');
      }
    },

    // ----------------------------------------------------
    // 9. SCHEDULE CONFIGURATION MODAL
    // ----------------------------------------------------
    openScheduleConfigModal: function () {
      const sched = window.BentoStorage.getSchedule();
      const modal = document.getElementById('schedule-settings-modal');

      document.getElementById('sched-start-date-input').value = sched.startDate || '2026-10-01';
      document.getElementById('sched-interval-input').value = sched.intervalDays || 1;

      window._schedEditingSequence = [...(sched.sequence || ['tpl_push', 'REST', 'tpl_pull', 'REST'])];
      this.renderScheduleSequenceSlots();

      modal.classList.remove('hidden');

      const btnAddSlot = document.getElementById('btn-sched-add-slot');
      if (btnAddSlot) {
        btnAddSlot.onclick = () => {
          window._schedEditingSequence.push('REST');
          this.renderScheduleSequenceSlots();
        };
      }
    },

    closeScheduleConfigModal: function () {
      document.getElementById('schedule-settings-modal').classList.add('hidden');
    },

    renderScheduleSequenceSlots: function () {
      const container = document.getElementById('sched-sequence-editor');
      if (!container) return;

      const templates = window.BentoStorage.getTemplates();

      container.innerHTML = window._schedEditingSequence.map((slotVal, idx) => {
        return `
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-size: 12px; font-weight:700; width: 55px; color: var(--text-tertiary);">Шаг ${idx + 1}:</span>
            <select class="search-input sched-slot-select" data-idx="${idx}" style="padding: 8px 12px; font-size: 13px; flex: 1;">
              <option value="REST" ${slotVal === 'REST' ? 'selected' : ''}>🧘 День отдыха (REST)</option>
              ${templates.map((t) => `<option value="${this.escapeHtml(t.id)}" ${slotVal === t.id ? 'selected' : ''}>🏋️ ${this.escapeHtml(t.name)}</option>`).join('')}
            </select>
            ${window._schedEditingSequence.length > 2 ? `
              <button class="icon-btn btn-sm btn-del-sched-slot" data-idx="${idx}" style="color: #f43f5e; width: 30px; height: 30px;">✕</button>
            ` : ''}
          </div>
        `;
      }).join('');

      container.querySelectorAll('.sched-slot-select').forEach((sel) => {
        sel.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          window._schedEditingSequence[idx] = e.target.value;
        });
      });

      container.querySelectorAll('.btn-del-sched-slot').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          window._schedEditingSequence.splice(idx, 1);
          this.renderScheduleSequenceSlots();
        });
      });
    },

    saveScheduleConfig: function () {
      const sDate = document.getElementById('sched-start-date-input').value;
      const interval = Math.max(1, Math.min(30, parseInt(document.getElementById('sched-interval-input').value, 10) || 1));

      const newSched = {
        startDate: sDate,
        intervalDays: interval,
        sequence: window._schedEditingSequence || ['tpl_push', 'REST'],
      };

      if (!window.BentoStorage.saveSchedule(newSched)) {
        alert('Не удалось сохранить расписание. Проверьте доступность хранилища устройства.');
        return;
      }
      this.closeScheduleConfigModal();
      this.renderTemplates();
      this.renderHomeBento();
      this.showToast('Интервальное расписание сохранено');
    },

    // ----------------------------------------------------
    // Utilities
    // ----------------------------------------------------
    getDateStamp: function () {
      const now = new Date();
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    },

    downloadJsonFile: function (content, filename) {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  };

  // Bootstrap when DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    window.BentoApp.init();
  });
})();
