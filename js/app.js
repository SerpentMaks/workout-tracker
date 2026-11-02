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
    selectedGear: 'all',
    selectedExerciseGoal: 'all',
    selectedGoal: 'mass',
    searchQuery: '',
  };

  window.BentoApp = {
    init: function () {
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
      document.documentElement.setAttribute('data-accent', settings.accent || 'amber');
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', effectiveTheme === 'dark' ? '#1d1f23' : '#e3e4e1');

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
      this.showToast('Цвет изменён');
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
    // Exercise drawing: built-in figures, then a custom exercise's own icon, then a plain plate.
    exerciseArt: function (ex, mode) {
      if (ex && window.BentoFigures.has(ex.id)) {
        return window.BentoFigures.svg(ex.id, mode || 'motion', `Техника: ${this.escapeHtml(ex.name)}`);
      }
      const custom = ex ? this.sanitizeSvgMarkup(ex.svgIcon) : '';
      return `<div class="fig-fallback">${custom || '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="10"/><circle cx="50" cy="50" r="9" fill="currentColor"/></svg>'}</div>`;
    },

    pluralRu: function (n, one, few, many) {
      const a = Math.abs(n) % 100;
      const b = a % 10;
      if (a > 10 && a < 20) return many;
      if (b > 1 && b < 5) return few;
      if (b === 1) return one;
      return many;
    },

    estimateMinutes: function (template) {
      const seconds = (template.exercises || []).reduce((sum, e) => {
        const sets = e.targetSets || 3;
        const rest = e.restSeconds === undefined || e.restSeconds === null ? 90 : e.restSeconds;
        const ex = window.BentoStorage.getExerciseById(e.exerciseId);
        const work = ex && ex.timed ? (e.targetReps || 40) : 40;
        return sum + sets * (work + rest);
      }, 0);
      return Math.max(5, Math.round(seconds / 300) * 5);
    },

    templateSummary: function (template) {
      const count = template.exercises.length;
      const sets = template.exercises.reduce((sum, e) => sum + (e.targetSets || 3), 0);
      return `${count} ${this.pluralRu(count, 'упражнение', 'упражнения', 'упражнений')}, ${sets} ${this.pluralRu(sets, 'подход', 'подхода', 'подходов')}, около ${this.estimateMinutes(template)} мин`;
    },

    // This week drawn as a loaded bar: one plate per finished workout, dashed slots for the rest of the goal.
    renderWeekBarSvg: function (done, goal) {
      const colours = ['--plate-red', '--plate-blue', '--plate-yellow', '--plate-green', '--plate-white'];
      const heights = [80, 74, 66, 56, 46];
      const slots = Math.min(14, Math.max(goal, done));
      const width = Math.min(26, 250 / slots);
      const gap = 2;
      const startX = 60;
      let plates = '';
      for (let i = 0; i < slots; i++) {
        const x = startX + i * (width + gap);
        const idx = i % colours.length;
        const h = heights[idx];
        const y = 46 - h / 2;
        if (i < done) {
          plates += `<rect x="${x}" y="${y}" width="${width}" height="${h}" rx="3" fill="var(${colours[idx]})"/>`;
          plates += `<rect class="plate-rim" x="${x}" y="${y + h / 2 - 7}" width="${width}" height="14"/>`;
        } else {
          plates += `<rect class="slot" x="${x + 0.75}" y="${y + 0.75}" width="${width - 1.5}" height="${h - 1.5}" rx="3"/>`;
        }
      }
      return `<svg class="week-bar" viewBox="0 0 360 92" preserveAspectRatio="xMinYMid meet" role="img" aria-label="Выполнено ${done} из ${goal}">
        <rect class="sleeve" x="0" y="42" width="360" height="8"/>
        <rect class="sleeve" x="46" y="30" width="10" height="32" rx="2"/>
        ${plates}
      </svg>`;
    },

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
        latestWeightStr = `${window.BentoStorage.convertWeight(lastLog.weight, unit)}`;
      }

      const now = new Date();
      const dateStrRaw = now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
      const dateStr = dateStrRaw.charAt(0).toUpperCase() + dateStrRaw.slice(1);

      let html = '';

      if (AppState.activeWorkout) {
        const totalSets = this.countTotalSets(AppState.activeWorkout);
        const compSets = this.countCompletedSets(AppState.activeWorkout);
        html += `
          <button class="active-banner" id="home-resume-workout-card">
            <span>
              <strong>${this.escapeHtml(AppState.activeWorkout.title)}</strong>
              Продолжить: ${compSets} из ${totalSets} подходов
            </span>
            <time id="home-active-duration">${this.formatDuration(AppState.activeWorkout.elapsedSeconds || 0)}</time>
          </button>
        `;
      }

      const heroName = (name) => this.escapeHtml(name);
      if (!scheduleInfo.isRest && scheduleInfo.template) {
        const tpl = scheduleInfo.template;
        const titleClass = tpl.name.length > 14 ? 'hero-title is-long' : 'hero-title';
        html += `
          <section class="hero">
            <div class="hero-date">${dateStr}</div>
            <h1 class="${titleClass}">${heroName(tpl.name)}</h1>
            <p class="hero-meta">${this.escapeHtml(this.templateSummary(tpl))}</p>
            <div class="hero-figure" id="home-hero-figure"></div>
            <button class="btn btn-primary btn-go" id="btn-start-scheduled-workout" data-template-id="${this.escapeHtml(tpl.id)}">Начать тренировку</button>
            <div class="hero-links">
              <button class="text-btn" id="btn-home-preview" data-template-id="${this.escapeHtml(tpl.id)}">Что сегодня делаем</button>
              <button class="text-btn" id="btn-home-quick-free">Своя тренировка</button>
            </div>
          </section>
        `;
      } else {
        const next = scheduleInfo.nextTemplate;
        html += `
          <section class="hero">
            <div class="hero-date">${dateStr}</div>
            <h1 class="hero-title">Отдых</h1>
            <p class="hero-meta">Мышцы растут между тренировками.${next ? ` Следующая через ${scheduleInfo.daysUntilNext} ${this.pluralRu(scheduleInfo.daysUntilNext, 'день', 'дня', 'дней')}: ${this.escapeHtml(next.name)}.` : ''}</p>
            <div class="hero-links">
              <button class="text-btn" id="btn-home-quick-free">Всё равно потренироваться</button>
              <button class="text-btn" id="btn-home-browse-templates">Сменить программу</button>
            </div>
          </section>
        `;
      }

      const left = Math.max(0, stats.weeklyGoal - stats.weeklyCompleted);
      html += `
        <div class="tile week-tile">
          <div class="week-head">
            <span class="week-title">${stats.weeklyCompleted} из ${this.escapeHtml(stats.weeklyGoal)} за неделю</span>
            <span class="small muted">${left === 0 ? 'Цель взята' : `Осталось ${left}`}</span>
          </div>
          ${this.renderWeekBarSvg(stats.weeklyCompleted, stats.weeklyGoal)}
        </div>
      `;

      // Next days in the cycle
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() + i);
        const info = window.BentoSchedule.getScheduleForDate(d);
        const label = d.toLocaleDateString('ru-RU', { weekday: 'short' });
        const name = info.isRest ? 'отдых' : (info.template ? (info.template.short || info.template.name.split(':')[0]) : '');
        days.push(`<div class="strip-day ${info.isRest ? 'is-rest' : ''} ${i === 0 ? 'is-today' : ''}"><b>${d.getDate()}</b>${this.escapeHtml(label)}<span>${this.escapeHtml(name)}</span></div>`);
      }
      html += `<div class="section-header"><h2 class="section-title">Неделя вперёд</h2><button class="text-btn" id="btn-home-programs">Программы</button></div><div class="strip">${days.join('')}</div>`;

      html += '<div class="bento-grid" style="margin-top: 8px;">';
      if (stats.lastWorkout) {
        const lastDate = new Date(stats.lastWorkout.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        html += `
          <button class="tile tile-btn" id="home-last-workout-card" data-workout-id="${this.escapeHtml(stats.lastWorkout.id)}">
            <span class="tile-label">Прошлая, ${lastDate}</span>
            <span class="tile-name">${this.escapeHtml(stats.lastWorkout.title)}</span>
            <span class="tile-sub">${this.escapeHtml(stats.lastWorkout.completedSets || 0)} подходов</span>
          </button>
        `;
      } else {
        html += `<div class="tile"><span class="tile-label">Всего тренировок</span><div class="tile-num">${stats.totalWorkouts}</div></div>`;
      }
      html += `
        <button class="tile tile-btn" id="home-weight-tile">
          <span class="tile-label">Вес тела</span>
          <span class="tile-num">${this.escapeHtml(latestWeightStr)} <span class="bento-stat-unit">${this.escapeHtml(unit)}</span></span>
          <span class="tile-sub">Добавить замер</span>
        </button>
      </div>`;

      container.innerHTML = html;

      if (!scheduleInfo.isRest && scheduleInfo.template && scheduleInfo.template.exercises[0]) {
        const heroEx = window.BentoStorage.getExerciseById(scheduleInfo.template.exercises[0].exerciseId);
        const heroBox = document.getElementById('home-hero-figure');
        if (heroEx && window.BentoFigures.has(heroEx.id)) {
          window.BentoFigures.mount(heroBox, heroEx.id, `Первое упражнение: ${heroEx.name}`);
        } else if (heroBox) {
          heroBox.remove();
        }
      }

      const on = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => fn(el));
      };
      on('btn-start-scheduled-workout', (el) => this.startWorkoutFromTemplate(el.getAttribute('data-template-id')));
      on('btn-home-preview', (el) => this.openDayPreview(el.getAttribute('data-template-id')));
      on('btn-home-quick-free', () => this.startFreeWorkout());
      on('btn-home-browse-templates', () => this.switchTab('templates'));
      on('btn-home-programs', () => this.switchTab('templates'));
      on('home-resume-workout-card', () => this.openActiveWorkoutScreen());
      on('home-last-workout-card', (el) => this.openPastWorkoutModal(el.getAttribute('data-workout-id')));
      on('home-weight-tile', () => this.openWeightModal());
    },

    // ----------------------------------------------------
    // 2. TEMPLATES & SCHEDULE ENGINE RENDERER
    // ----------------------------------------------------
    renderProgramStrip: function (sequence) {
      const cells = sequence.map((id) => {
        if (id === 'REST') return '<div class="strip-day is-rest"><span>отдых</span></div>';
        const t = window.BentoStorage.getTemplateById(id);
        const name = t ? (t.short || t.name.split(':')[0]) : '';
        return `<div class="strip-day"><span>${this.escapeHtml(name)}</span></div>`;
      });
      return `<div class="strip">${cells.join('')}</div>`;
    },

    renderTemplates: function () {
      const listContainer = document.getElementById('templates-list-container');
      if (!listContainer) return;

      const library = window.BENTO_LIBRARY;
      const scheduleConfig = window.BentoStorage.getSchedule();
      const scheduleInfo = window.BentoSchedule.getTodaySchedule();
      const templates = window.BentoStorage.getTemplates();
      const goal = AppState.selectedGoal;
      const goalInfo = library.goals.find((g) => g.id === goal) || library.goals[0];

      document.getElementById('goal-selector').innerHTML = library.goals.map((g) => `
        <button class="goal-btn ${g.id === goal ? 'active' : ''}" data-goal="${g.id}" aria-pressed="${g.id === goal}">
          <span class="goal-plate" data-plate="${g.plate}">${g.kg}</span>
          ${g.name}
        </button>
      `).join('');
      document.getElementById('goal-intro').textContent = goalInfo.intro;
      document.querySelectorAll('#goal-selector .goal-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          AppState.selectedGoal = btn.getAttribute('data-goal');
          this.renderTemplates();
        });
      });

      const programsBox = document.getElementById('programs-list');
      programsBox.innerHTML = library.programs.filter((p) => p.goal === goal).map((p) => {
        const isCurrent = scheduleConfig.programId === p.id;
        const dayIds = p.sequence.filter((id, i, arr) => id !== 'REST' && arr.indexOf(id) === i);
        const dayRows = dayIds.map((id) => {
          const t = window.BentoStorage.getTemplateById(id);
          if (!t) return '';
          return `<button class="day-row" data-open-day="${this.escapeHtml(id)}"><span>${this.escapeHtml(t.name)}</span><small>${t.exercises.length} упр., ${this.estimateMinutes(t)} мин</small></button>`;
        }).join('');
        const sources = p.sources.map((key) => {
          const s = library.sources[key];
          return s ? `<a href="${this.escapeHtml(s.url)}" target="_blank" rel="noopener">${this.escapeHtml(s.cite)}</a>` : '';
        }).join('');
        const kitNames = { band: 'Резина', handles: 'Упоры', pullbar: 'Турник', dipbars: 'Брусья', none: 'Без инвентаря' };
        const kit = (p.kit || []).map((k) => `<span class="tag">${kitNames[k]}</span>`).join('');
        return `
          <article class="tile program" data-plate="${goalInfo.plate}">
            <h3 class="program-name">${this.escapeHtml(p.name)}</h3>
            <p class="program-meta">${p.days} ${this.pluralRu(p.days, 'день', 'дня', 'дней')} в неделю, ${this.escapeHtml(p.level.toLowerCase())} уровень, ${this.escapeHtml(p.place.toLowerCase())}
              ${isCurrent ? '<span class="badge badge-now">Сейчас в плане</span>' : (p.recommended ? '<span class="badge">С него начать</span>' : '')}</p>
            ${kit ? `<div class="kit-row">${kit}</div>` : ''}
            ${this.renderProgramStrip(p.sequence)}
            <p class="program-why">${this.escapeHtml(p.why)}</p>
            <div class="source-links">${sources}</div>
            <div class="program-days">${dayRows}</div>
            ${isCurrent ? '' : `<button class="btn btn-primary btn-block" data-apply-program="${this.escapeHtml(p.id)}">Сделать моим планом</button>`}
          </article>
        `;
      }).join('');
      programsBox.querySelectorAll('[data-open-day]').forEach((btn) => {
        btn.addEventListener('click', () => this.openDayPreview(btn.getAttribute('data-open-day')));
      });
      programsBox.querySelectorAll('[data-apply-program]').forEach((btn) => {
        btn.addEventListener('click', () => this.applyProgram(btn.getAttribute('data-apply-program')));
      });

      const scheduleContainer = document.getElementById('schedule-cycle-card');
      if (scheduleContainer) {
        const current = library.programs.find((p) => p.id === scheduleConfig.programId);
        scheduleContainer.innerHTML = `
          <div class="tile-name" style="margin-bottom: 8px;">${current ? this.escapeHtml(current.name) : 'Свой цикл'}</div>
          ${this.renderProgramStrip(scheduleConfig.sequence || [])}
          <p class="small muted" style="margin-top: 8px;">Сегодня день ${scheduleInfo.cycleDay} из ${scheduleInfo.cycleTotalDays}: ${scheduleInfo.isRest ? 'отдых' : this.escapeHtml(scheduleInfo.template ? scheduleInfo.template.name : 'тренировка')}.</p>
        `;
      }

      const scienceBox = document.getElementById('science-list');
      if (scienceBox && !scienceBox.childElementCount) {
        scienceBox.innerHTML = library.principles.map((key) => {
          const s = library.sources[key];
          return `<details class="science-item"><summary>${this.escapeHtml(s.title)}</summary><p>${this.escapeHtml(s.text)}<br><a href="${this.escapeHtml(s.url)}" target="_blank" rel="noopener">${this.escapeHtml(s.cite)}</a></p></details>`;
        }).join('') + '<p class="science-note">Многие исследования небольшие и проведены на молодых людях. Это справка, а не медицинская рекомендация: при болях, травмах или болезнях сначала поговорите с врачом.</p>';
      }

      if (templates.length === 0) {
        listContainer.innerHTML = '<div class="empty">Здесь будут ваши тренировки. Создайте свою или измените день из любой программы.</div>';
        return;
      }

      listContainer.innerHTML = templates.map((tpl) => `
        <div class="tile saved-tpl">
          <div class="bento-card-header" style="margin-bottom: 2px;">
            <div class="tile-name">${this.escapeHtml(tpl.name)}</div>
            <button class="icon-btn btn-sm btn-edit-template" data-tpl-id="${this.escapeHtml(tpl.id)}" aria-label="Изменить тренировку">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>
            </button>
          </div>
          <p class="small muted" style="margin-bottom: 10px;">${this.escapeHtml(this.templateSummary(tpl))}</p>
          <button class="btn btn-secondary btn-block btn-sm btn-start-tpl" data-tpl-id="${this.escapeHtml(tpl.id)}">Начать</button>
        </div>
      `).join('');

      listContainer.querySelectorAll('.btn-start-tpl').forEach((btn) => {
        btn.addEventListener('click', () => this.startWorkoutFromTemplate(btn.getAttribute('data-tpl-id')));
      });
      listContainer.querySelectorAll('.btn-edit-template').forEach((btn) => {
        btn.addEventListener('click', () => this.openTemplateEditorModal(btn.getAttribute('data-tpl-id')));
      });
    },

    applyProgram: function (programId) {
      const program = window.BENTO_LIBRARY.programs.find((p) => p.id === programId);
      if (!program) return;
      const saved = window.BentoStorage.saveSchedule({
        startDate: this.getDateStamp(),
        intervalDays: 1,
        sequence: program.sequence.slice(),
        programId: program.id,
      });
      if (!saved || !window.BentoStorage.saveSettings({ weeklyGoal: program.days })) {
        this.showToast('Не удалось сохранить план');
        return;
      }
      this.renderTemplates();
      this.renderHomeBento();
      this.renderProfile();
      this.showToast(`В плане: ${program.name}`);
    },

    formatTarget: function (item) {
      const sets = item.targetSets || (item.sets ? item.sets.length : 3);
      return item.repRange ? `${sets} × ${item.repRange}` : `${sets} × ${item.targetReps || 10}`;
    },

    openDayPreview: function (templateId) {
      const tpl = window.BentoStorage.getTemplateById(templateId);
      if (!tpl) return;
      const modal = document.getElementById('day-preview-modal');
      document.getElementById('day-preview-title').textContent = tpl.name;
      const body = document.getElementById('day-preview-body');
      const rows = tpl.exercises.map((item, idx) => {
        const ex = window.BentoStorage.getExerciseById(item.exerciseId);
        const prevGroup = idx > 0 ? tpl.exercises[idx - 1].group : null;
        const groupLabel = item.group && item.group !== prevGroup ? `<div class="group-tag" style="margin: 6px 0 2px;">Без отдыха между упражнениями группы</div>` : '';
        const rest = item.restSeconds ? `отдых ${item.restSeconds} с` : '';
        return `${groupLabel}<button class="ex-row" data-ex-id="${this.escapeHtml(item.exerciseId)}">
          ${this.exerciseArt(ex)}
          <span class="ex-row-name">${this.escapeHtml(ex ? ex.name : 'Упражнение')}</span>
          <span class="ex-row-sets">${this.escapeHtml(this.formatTarget(item))}<small>${rest}</small></span>
        </button>`;
      }).join('');
      body.innerHTML = `
        <p class="small muted" style="margin-bottom: 10px;">${this.escapeHtml(tpl.description || '')} ${this.escapeHtml(this.templateSummary(tpl))}.</p>
        <div class="row-list" style="margin-bottom: 14px;">${rows}</div>
        <div class="btn-row">
          <button class="btn btn-primary" id="btn-day-start">Начать</button>
          <button class="btn btn-secondary" id="btn-day-edit" style="flex: none;">Изменить</button>
        </div>
      `;
      modal.classList.remove('hidden');
      body.querySelectorAll('.ex-row').forEach((row) => {
        row.addEventListener('click', () => this.openExerciseDetailModal(row.getAttribute('data-ex-id')));
      });
      document.getElementById('btn-day-start').addEventListener('click', () => {
        modal.classList.add('hidden');
        this.startWorkoutFromTemplate(templateId);
      });
      document.getElementById('btn-day-edit').addEventListener('click', () => {
        modal.classList.add('hidden');
        this.openTemplateEditorModal(templateId);
      });
    },

    bindTemplatesAndSchedule: function () {
      const currentProgram = window.BENTO_LIBRARY.programs.find((p) => p.id === window.BentoStorage.getSchedule().programId);
      AppState.selectedGoal = currentProgram ? currentProgram.goal : 'mass';

      const clicks = {
        'btn-create-template': () => this.openTemplateEditorModal(null),
        'btn-edit-schedule-modal': () => this.openScheduleConfigModal(),
        'btn-close-tpl-editor': () => this.closeTemplateEditorModal(),
        'btn-save-template': () => this.saveTemplateFromEditor(),
        'btn-delete-template': () => this.deleteTemplateFromEditor(),
        'btn-close-sched-modal': () => this.closeScheduleConfigModal(),
        'btn-save-schedule-config': () => this.saveScheduleConfig(),
        'btn-close-day-preview': () => document.getElementById('day-preview-modal').classList.add('hidden'),
      };
      Object.keys(clicks).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', clicks[id]);
      });
    },

    // ----------------------------------------------------
    // 3. EXERCISE CATALOG RENDERER & ACTIONS
    // ----------------------------------------------------
    renderExerciseFilters: function () {
      const build = (id, options, current) => {
        const box = document.getElementById(id);
        if (!box) return;
        box.innerHTML = options.map((o) => `<button class="chip ${o[0] === current ? 'active' : ''}" data-value="${o[0]}" aria-pressed="${o[0] === current}">${o[1]}</button>`).join('');
      };
      build('muscle-filter-control', [['all', 'Все мышцы'], ['chest', 'Грудь'], ['back', 'Спина'], ['legs', 'Ноги'], ['shoulders', 'Плечи'], ['arms', 'Руки'], ['core', 'Кор'], ['cardio', 'Кардио']], AppState.selectedExerciseCategory);
      build('gear-filter-control', [['all', 'Любой инвентарь'], ['home', 'Для дома'], ['gym', 'Для зала'], ['band', 'Резина'], ['handles', 'Упоры'], ['pullbar', 'Турник'], ['dipbars', 'Брусья'], ['none', 'Без инвентаря']], AppState.selectedGear);
      build('goal-filter-control', [['all', 'Любая цель'], ['mass', 'Масса'], ['strength', 'Сила'], ['fat', 'Похудение'], ['beginner', 'Новичкам'], ['proven', 'С исследованиями']], AppState.selectedExerciseGoal);
    },

    renderExercises: function () {
      const container = document.getElementById('exercises-catalog-container');
      if (!container) return;

      this.renderExerciseFilters();
      const exercises = window.BentoStorage.getExercises();
      const category = AppState.selectedExerciseCategory;
      const gear = AppState.selectedGear;
      const goal = AppState.selectedExerciseGoal;
      const query = (AppState.searchQuery || '').toLowerCase().trim();
      const HOME_GEAR = ['band', 'handles', 'pullbar', 'dipbars', 'none'];

      const filtered = exercises.filter((ex) => {
        const kit = ex.gear || [];
        const matchesGear = gear === 'all'
          || (gear === 'home' && kit.some((g) => HOME_GEAR.indexOf(g) >= 0))
          || (gear === 'gym' && kit.some((g) => HOME_GEAR.indexOf(g) < 0))
          || kit.indexOf(gear) >= 0;
        const matchesGoal = goal === 'all' || (goal === 'proven' ? !!ex.evidence : (ex.goals || []).indexOf(goal) >= 0);
        const matchesCategory = category === 'all' || ex.category === category;
        const matchesQuery = !query ||
          ex.name.toLowerCase().includes(query) ||
          (ex.nameEn && ex.nameEn.toLowerCase().includes(query)) ||
          (ex.targetMuscles && ex.targetMuscles.some((m) => m.toLowerCase().includes(query)));
        return matchesCategory && matchesQuery && matchesGear && matchesGoal;
      });

      const count = document.getElementById('catalog-count');
      if (count) count.textContent = `${filtered.length} ${this.pluralRu(filtered.length, 'упражнение', 'упражнения', 'упражнений')}`;

      if (filtered.length === 0) {
        container.innerHTML = '<div class="empty" style="grid-column: span 2;">Ничего не нашлось. Уберите один из фильтров или измените запрос.</div>';
        return;
      }

      container.innerHTML = filtered.map((ex) => `
        <button class="ex-card" data-ex-id="${this.escapeHtml(ex.id)}">
          ${this.exerciseArt(ex)}
          <span class="ex-card-name">${this.escapeHtml(ex.name)}</span>
          <span class="ex-card-meta">${ex.evidence ? '<i class="ev-dot" title="Есть исследования"></i>' : ''}${this.escapeHtml((ex.targetMuscles || [])[0] || ex.categoryName || '')}</span>
        </button>
      `).join('');

      container.querySelectorAll('.ex-card').forEach((card) => {
        card.addEventListener('click', () => this.openExerciseDetailModal(card.getAttribute('data-ex-id')));
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

      const chipFilter = (id, key) => {
        const box = document.getElementById(id);
        if (!box) return;
        box.addEventListener('click', (e) => {
          const chip = e.target.closest('.chip');
          if (!chip) return;
          AppState[key] = chip.getAttribute('data-value');
          this.renderExercises();
        });
      };
      chipFilter('muscle-filter-control', 'selectedExerciseCategory');
      chipFilter('gear-filter-control', 'selectedGear');
      chipFilter('goal-filter-control', 'selectedExerciseGoal');

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
      const unit = window.BentoStorage.getSettings().unit || 'kg';
      const muscles = (ex.targetMuscles || []).map((m, i) => `<span class="tag ${i === 0 ? 'tag-accent' : ''}">${this.escapeHtml(m)}</span>`).join('');
      const GEAR = { barbell: 'Штанга', dumbbell: 'Гантели', kettlebell: 'Гиря', machine: 'Тренажёр', cable: 'Блок', bench: 'Скамья', band: 'Резина', handles: 'Упоры', pullbar: 'Турник', dipbars: 'Брусья', none: 'Без инвентаря' };
      const gear = (ex.gear || []).map((g) => `<span class="tag">${GEAR[g] || this.escapeHtml(g)}</span>`).join('');

      const lastPerf = window.BentoStorage.getLastPerformanceForExercise(exId);
      let lastHtml = '';
      if (lastPerf && lastPerf.bestSet) {
        const perfDate = new Date(lastPerf.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        lastHtml = `<div class="note"><strong>${this.escapeHtml(window.BentoStorage.convertWeight(lastPerf.bestSet.weight, unit))} ${this.escapeHtml(unit)} × ${this.escapeHtml(lastPerf.bestSet.reps)}</strong>Лучший подход, ${perfDate}</div>`;
      }

      let evidenceHtml = '';
      if (ex.evidence) {
        const LEVEL = { rct: 'Сравнительное исследование', emg: 'Измерение активности мышц (ЭМГ)', review: 'Обзор исследований' };
        const library = window.BENTO_LIBRARY.sources;
        const links = (ex.evidence.sources || []).map((k) => library[k] ? `<a href="${this.escapeHtml(library[k].url)}" target="_blank" rel="noopener">${this.escapeHtml(library[k].cite)}</a>` : '').join('');
        evidenceHtml = `<div class="evidence"><strong>${LEVEL[ex.evidence.level] || 'Исследование'}</strong>${this.escapeHtml(ex.evidence.text)}<br>${links}</div>`;
      }

      const hasFigure = window.BentoFigures.has(ex.id);
      body.innerHTML = `
        <div class="tech-stage" id="ex-live-figure">${this.exerciseArt(ex)}</div>
        ${hasFigure ? `<div class="tech-stills">
          <div class="tech-still">${this.exerciseArt(ex, 'start')}Начало</div>
          <div class="tech-still">${this.exerciseArt(ex, 'finish')}Конец</div>
        </div>` : '<div style="height: 12px;"></div>'}
        <div class="tag-list">${muscles}${gear}</div>
        ${evidenceHtml}
        ${lastHtml}
        <h3 class="detail-h">Как выполнять</h3>
        <ol class="steps">
          <li><strong>Исходное положение</strong>${this.escapeHtml(inst.initial || 'Примите устойчивое исходное положение.')}</li>
          <li><strong>Главное усилие</strong>${this.escapeHtml(inst.concentric || 'Выполняйте движение за счёт целевых мышц.')}</li>
          <li><strong>Возврат</strong>${this.escapeHtml(inst.eccentric || 'Контролируйте вес на обратном пути.')}</li>
        </ol>
        <div class="note"><strong>Дыхание</strong>${this.escapeHtml(inst.breathing || 'Вдох на расслаблении, выдох на усилии.')}</div>
        <div class="note note-warn"><strong>Частые ошибки</strong>${this.escapeHtml(inst.mistakes || 'Рывки и потеря контроля над весом.')}</div>
        <div class="stack" style="margin-top: 14px;">
          <button class="btn btn-primary btn-block" id="btn-start-from-ex">Начать тренировку с этого упражнения</button>
          <button class="btn btn-secondary btn-block btn-sm" id="btn-view-ex-history">История подходов</button>
        </div>
      `;
      body.scrollTop = 0;

      modal.classList.remove('hidden');
      if (hasFigure) window.BentoFigures.mount(document.getElementById('ex-live-figure'), ex.id, `Техника: ${ex.name}`);

      document.getElementById('btn-start-from-ex').addEventListener('click', () => {
        modal.classList.add('hidden');
        document.getElementById('day-preview-modal').classList.add('hidden');
        if (AppState.activeWorkout) {
          this.addExerciseToActiveWorkout(exId);
          this.openActiveWorkoutScreen();
        } else {
          this.startWorkoutFromExercise(exId);
        }
      });
      document.getElementById('btn-view-ex-history').addEventListener('click', () => {
        modal.classList.add('hidden');
        this.openExerciseHistoryModal(exId);
      });
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
              <span>Подход ${idx + 1}</span>
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
      const catNames = { chest: 'Грудь', back: 'Спина', legs: 'Ноги', shoulders: 'Плечи', arms: 'Руки', core: 'Кор', cardio: 'Кардио' };

      const newEx = {
        id: 'custom_' + Date.now(),
        name: name,
        nameEn: name,
        category: cat,
        categoryName: catNames[cat] || cat,
        targetMuscles: muscles.length > 0 ? muscles : [catNames[cat]],
        isCustom: true,
        gear: ['none'],
        goals: [],
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
          repRange: item.repRange || '',
          restSeconds: item.restSeconds === undefined ? null : item.restSeconds,
          group: item.group || null,
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
          weight: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.weight : 0,
          reps: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.reps : 10,
          completed: false,
        },
        {
          id: 's_' + Date.now() + '_2',
          setNumber: 2,
          weight: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.weight : 0,
          reps: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.reps : 10,
          completed: false,
        },
        {
          id: 's_' + Date.now() + '_3',
          setNumber: 3,
          weight: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.weight : 0,
          reps: lastPerf && lastPerf.lastSet ? lastPerf.lastSet.reps : 10,
          completed: false,
        },
      ];

      const exItem = {
        exerciseId: exerciseId,
        name: exObj ? exObj.name : 'Упражнение',
        category: exObj ? exObj.category : 'chest',
        progressionWeight: '',
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
      this.showToast('Тренировка начата');
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
          <div class="empty">
            <p style="margin-bottom: 14px;">Добавьте первое упражнение, чтобы начать.</p>
            <button class="btn btn-primary" id="btn-empty-add-exercise">Выбрать упражнение</button>
          </div>
        `;
        document.getElementById('btn-empty-add-exercise').addEventListener('click', () => this.openExercisePickerModal());
        return;
      }

      const exercisesList = AppState.activeWorkout.exercises;
      container.innerHTML = exercisesList.map((exItem, exIdx) => {
        const lastPerf = window.BentoStorage.getLastPerformanceForExercise(exItem.exerciseId);
        const exObj = window.BentoStorage.getExerciseById(exItem.exerciseId);
        const timed = !!(exObj && exObj.timed);

        const setRows = exItem.sets.map((s, sIdx) => {
          let prevSetHint = '—';
          if (lastPerf && lastPerf.allCompletedSets && lastPerf.allCompletedSets[sIdx]) {
            const p = lastPerf.allCompletedSets[sIdx];
            prevSetHint = `${window.BentoStorage.convertWeight(p.weight, unit)}×${p.reps}`;
          } else if (lastPerf && lastPerf.lastSet) {
            prevSetHint = `${window.BentoStorage.convertWeight(lastPerf.lastSet.weight, unit)}×${lastPerf.lastSet.reps}`;
          }
          const weightVal = s.weight ? window.BentoStorage.convertWeight(s.weight, unit) : '';

          return `
            <tr class="set-row ${s.completed ? 'is-done' : ''}" data-ex-idx="${exIdx}" data-set-idx="${sIdx}">
              <td><span class="set-num-badge">${this.escapeHtml(s.setNumber)}</span></td>
              <td><div class="set-prev-hint">${this.escapeHtml(prevSetHint)}</div></td>
              <td><input type="number" step="0.5" inputmode="decimal" placeholder="0" aria-label="Вес, подход ${this.escapeHtml(s.setNumber)}" class="set-input-box set-weight-input" value="${this.escapeHtml(weightVal)}" data-ex-idx="${exIdx}" data-set-idx="${sIdx}"></td>
              <td><input type="number" step="1" inputmode="numeric" aria-label="${timed ? 'Секунды' : 'Повторы'}, подход ${this.escapeHtml(s.setNumber)}" class="set-input-box set-reps-input" value="${this.escapeHtml(s.reps)}" data-ex-idx="${exIdx}" data-set-idx="${sIdx}"></td>
              <td><button class="set-check-btn ${s.completed ? 'checked' : ''}" data-ex-idx="${exIdx}" data-set-idx="${sIdx}" aria-label="Отметить подход ${this.escapeHtml(s.setNumber)}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
              </button></td>
            </tr>
          `;
        }).join('');

        const prevGroup = exIdx > 0 ? exercisesList[exIdx - 1].group : null;
        const nextGroup = exIdx < exercisesList.length - 1 ? exercisesList[exIdx + 1].group : null;
        const inGroup = exItem.group && (exItem.group === nextGroup || exItem.group === prevGroup);
        const targetParts = [];
        if (exItem.repRange) targetParts.push(`Цель ${exItem.repRange}`);
        else if (exItem.progressionReps) targetParts.push(`Цель ${exItem.progressionReps}`);
        if (inGroup && exItem.group === nextGroup) targetParts.push('сразу следующее');
        else if (exItem.restSeconds) targetParts.push(`отдых ${exItem.restSeconds} с`);

        return `
          <div class="workout-exercise-card" data-ex-idx="${exIdx}">
            <div class="workout-exercise-header">
              <button class="workout-fig-btn btn-ex-tech" data-ex-id="${this.escapeHtml(exItem.exerciseId)}" aria-label="Техника: ${this.escapeHtml(exItem.name)}">${this.exerciseArt(exObj)}</button>
              <div>
                <div class="workout-exercise-title">${this.escapeHtml(exItem.name)}</div>
                <div class="workout-exercise-target">${this.escapeHtml(targetParts.join(', '))}</div>
              </div>
              <div class="workout-exercise-actions">
                <button class="icon-btn btn-sm btn-ex-hist" data-ex-id="${this.escapeHtml(exItem.exerciseId)}" aria-label="История подходов">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                </button>
                <button class="icon-btn btn-sm btn-ex-remove" data-ex-idx="${exIdx}" aria-label="Убрать упражнение">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
              </div>
            </div>
            <table class="set-table">
              <thead><tr><th scope="col">№</th><th scope="col">Прошлый</th><th scope="col">${this.escapeHtml(unit)}</th><th scope="col">${timed ? 'Сек' : 'Повт'}</th><th scope="col"><span class="visually-hidden">Готово</span></th></tr></thead>
              <tbody>${setRows}</tbody>
            </table>
            <div class="set-actions">
              <button class="text-btn btn-add-set" data-ex-idx="${exIdx}">Добавить подход</button>
              ${exItem.sets.length > 1 ? `<button class="text-btn" data-ex-idx="${exIdx}" id="btn-remove-last-set-${exIdx}">Убрать последний</button>` : ''}
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
        btn.addEventListener('click', () => {
          const exIdx = parseInt(btn.getAttribute('data-ex-idx'));
          const sIdx = parseInt(btn.getAttribute('data-set-idx'));
          const exItem = AppState.activeWorkout.exercises[exIdx];
          const newStatus = !exItem.sets[sIdx].completed;

          exItem.sets[sIdx].completed = newStatus;
          this.persistActiveWorkout();

          btn.classList.toggle('checked', newStatus);
          const row = btn.closest('.set-row');
          if (row) row.classList.toggle('is-done', newStatus);

          this.updateActiveWorkoutMetricsTicker();

          if (newStatus) {
            window.BentoFeedback.playSetCompleteClick();
            window.BentoFeedback.hapticSetCheck();

            // Inside a superset or circuit the rest comes only after the last exercise of the group.
            const next = AppState.activeWorkout.exercises[exIdx + 1];
            const leadsIntoGroup = exItem.group && next && next.group === exItem.group;
            const planned = exItem.restSeconds === null || exItem.restSeconds === undefined
              ? window.BentoStorage.getSettings().defaultRestSeconds || 90
              : exItem.restSeconds;
            if (!leadsIntoGroup && planned > 0) window.BentoTimer.start(planned);
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
            weight: prevSet ? prevSet.weight : 0,
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
        btn.addEventListener('click', () => this.openExerciseDetailModal(btn.getAttribute('data-ex-id')));
      });

      container.querySelectorAll('.btn-ex-hist').forEach((btn) => {
        btn.addEventListener('click', () => this.openExerciseHistoryModal(btn.getAttribute('data-ex-id')));
      });

      container.querySelectorAll('.btn-ex-remove').forEach((btn) => {
        btn.addEventListener('click', () => {
          const exIdx = parseInt(btn.getAttribute('data-ex-idx'));
          if (confirm('Убрать это упражнение из тренировки?')) {
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
        return !q || e.name.toLowerCase().includes(q)
          || (e.categoryName && e.categoryName.toLowerCase().includes(q))
          || (e.targetMuscles || []).some((m) => m.toLowerCase().includes(q));
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div class="empty">Ничего не нашлось. Измените запрос.</div>';
        return;
      }

      container.innerHTML = filtered.map((ex) => `
        <button class="ex-row picker-item" data-ex-id="${this.escapeHtml(ex.id)}">
          ${this.exerciseArt(ex)}
          <span class="ex-row-name">${this.escapeHtml(ex.name)}<br><span class="small muted">${this.escapeHtml((ex.targetMuscles || [])[0] || ex.categoryName || '')}</span></span>
          <span class="ex-row-sets" aria-hidden="true">+</span>
        </button>
      `).join('');

      container.querySelectorAll('.picker-item').forEach((card) => {
        card.addEventListener('click', () => {
          const exId = card.getAttribute('data-ex-id');
          if (AppState.exercisePickerTarget === 'template') {
            if (!window._tplEditingExercises) window._tplEditingExercises = [];
            window._tplEditingExercises.push({
              exerciseId: exId,
              targetSets: 3,
              targetWeight: 0,
              targetReps: 10,
              progressionWeight: '',
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

      const defaultWeight = lastPerf && lastPerf.lastSet ? lastPerf.lastSet.weight : 0;
      const defaultReps = lastPerf && lastPerf.lastSet ? lastPerf.lastSet.reps : 10;

      const newExItem = {
        exerciseId: exId,
        name: exObj ? exObj.name : 'Упражнение',
        category: exObj ? exObj.category : 'chest',
        progressionWeight: '',
        progressionReps: 'до 12 повт',
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

      this.showToast('Тренировка сохранена в дневник');
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
          modalPauseToggle.textContent = window.BentoTimer.isRunning() ? 'Пауза' : 'Продолжить';
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
            <span class="bento-card-tag">Всего тренировок</span>
            <div class="bento-stat-num">${stats.totalWorkouts}</div>
                      </div>
          <div class="bento-card bento-col-1">
            <span class="bento-card-tag">Всего подходов</span>
            <div class="bento-stat-num">${stats.totalCompletedSets}</div>
                      </div>
        `;
      }

      // Full History List
      const historyList = document.getElementById('analytics-history-list');
      if (historyList) {
        const history = window.BentoStorage.getHistory();

        if (history.length === 0) {
          historyList.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-tertiary);">Здесь появятся завершённые тренировки.</div>`;
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
            В этот день тренировок нет.
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
              <span>Подход ${this.escapeHtml(s.setNumber)}</span>
              <strong>${this.escapeHtml(window.BentoStorage.convertWeight(s.weight, unit))} ${this.escapeHtml(unit)} × ${this.escapeHtml(s.reps)} повт ${s.completed ? '✓' : ''}</strong>
            </div>
          `).join('');

          return `
            <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: var(--text-primary); font-size: 15px;">${this.escapeHtml(ex.name)}</strong>
                <span class="category-tag">${this.escapeHtml(this.categoryLabel(ex.category))}</span>
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
            <div class="small muted">Время</div>
            <div class="tile-num" style="font-size: 26px;">${durStr}</div>
          </div>
          <div>
            <div class="small muted">Подходы</div>
            <div class="tile-num" style="font-size: 26px;">${this.escapeHtml(workout.completedSets || 0)}/${this.escapeHtml(workout.totalSets || 0)}</div>
          </div>
          <div>
            <div class="small muted">Упражнения</div>
            <div class="tile-num" style="font-size: 26px;">${exCount}</div>
          </div>
        </div>

        <div class="section-header" style="margin-top: 0;">
          <h3 class="section-title" style="font-size: 23px;">Подходы</h3>
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
    // Version and real screen numbers, for checking layout problems on the phone itself
    renderDiagnostics: function () {
      const el = document.getElementById('app-diagnostics');
      if (!el) return;
      const styles = getComputedStyle(document.querySelector('.bottom-tab-bar'));
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);';
      document.body.appendChild(probe);
      const top = parseInt(getComputedStyle(probe).paddingTop, 10) || 0;
      probe.remove();
      const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      el.textContent = `Версия 6. ${standalone ? 'С экрана «Домой»' : 'В браузере'}: экран ${window.screen.width}×${window.screen.height}, окно ${window.innerWidth}×${window.innerHeight}, отступ сверху ${top}, снизу ${parseInt(styles.paddingBottom, 10) || 0}.`;
    },

    renderProfile: function () {
      this.renderDiagnostics();
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
          logsContainer.innerHTML = `<div style="font-size: 12px; color: var(--text-tertiary); padding: 8px 0;">Замеров пока нет.</div>`;
        } else {
          const rev = [...metrics.logs].reverse();
          logsContainer.innerHTML = rev.map((l) => {
            const wVal = window.BentoStorage.convertWeight(l.weight, unit);
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border-subtle); font-size: 13px;">
                <span style="color: var(--text-secondary);">${this.escapeHtml(l.date)}</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <strong>${this.escapeHtml(wVal)} ${this.escapeHtml(unit)}</strong>
                  <button class="btn-del-weight-log" data-log-id="${this.escapeHtml(l.id)}" style="color: var(--danger); min-width: 32px; min-height: 32px;" title="Удалить">✕</button>
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
          this.showToast(e.target.checked ? 'Звук включён' : 'Звук выключен');
        });
      }

      const vibToggle = document.getElementById('settings-vibration-toggle');
      if (vibToggle) {
        vibToggle.addEventListener('change', (e) => {
          window.BentoStorage.saveSettings({ vibrationEnabled: e.target.checked });
          this.showToast(e.target.checked ? 'Вибрация включена' : 'Вибрация выключена');
        });
      }

      const btnExportAll = document.getElementById('btn-export-full-backup');
      if (btnExportAll) {
        btnExportAll.addEventListener('click', () => {
          const json = window.BentoStorage.exportAllData();
          this.downloadJsonFile(json, `bentofit_backup_${this.getDateStamp()}.json`);
          this.showToast('Копия сохранена');
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
              this.showToast('Данные восстановлены');
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
        alert('Введите вес больше нуля.');
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
      this.showToast('Замер сохранён');
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
        title.textContent = 'Изменить тренировку';
        nameInput.value = tpl ? tpl.name : '';
        descInput.value = tpl ? tpl.description || '' : '';
        btnDelete.style.display = tpl && tpl.isLibrary ? 'none' : 'block';
        this.renderTemplateEditorExercises(tpl ? tpl.exercises : []);
      } else {
        title.textContent = 'Новая тренировка';
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
            Упражнений пока нет. Нажмите «Добавить».
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
              <button class="icon-btn btn-sm btn-tpl-del-ex" data-idx="${idx}" style="color: var(--danger);">✕</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 6px;">
              <div>
                <label style="font-size: 12px; color: var(--text-tertiary);">Подходы</label>
                <input type="number" min="1" max="20" class="search-input tpl-inp-sets" data-idx="${idx}" value="${this.escapeHtml(e.targetSets || 3)}" style="min-height: 40px; padding: 6px; text-align: center;">
              </div>
              <div>
                <label style="font-size: 12px; color: var(--text-tertiary);">Вес, ${this.escapeHtml(unit)}</label>
                <input type="number" step="0.5" class="search-input tpl-inp-weight" data-idx="${idx}" value="${this.escapeHtml(window.BentoStorage.convertWeight(e.targetWeight ?? 50, unit))}" style="min-height: 40px; padding: 6px; text-align: center;">
              </div>
              <div>
                <label style="font-size: 12px; color: var(--text-tertiary);">Повторы</label>
                <input type="number" class="search-input tpl-inp-reps" data-idx="${idx}" value="${this.escapeHtml(e.targetReps || 10)}" style="min-height: 40px; padding: 6px; text-align: center;">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="font-size: 12px; color: var(--text-tertiary);">Когда повышать вес</label>
                <input type="text" class="search-input tpl-inp-prog-w" data-idx="${idx}" value="${this.escapeHtml(e.progressionWeight || '')}" style="min-height: 40px; padding: 6px 8px; font-size: 14px;">
              </div>
              <div>
                <label style="font-size: 12px; color: var(--text-tertiary);">Цель по повторам</label>
                <input type="text" class="search-input tpl-inp-prog-r" data-idx="${idx}" value="${this.escapeHtml(e.progressionReps || 'до 12 повт')}" style="min-height: 40px; padding: 6px 8px; font-size: 14px;">
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
        alert('Введите название тренировки.');
        return;
      }
      if (!window._tplEditingExercises || window._tplEditingExercises.length === 0) {
        alert('Добавьте хотя бы одно упражнение.');
        return;
      }

      const id = AppState.editingTemplateId || ('tpl_' + Date.now());
      const tpl = {
        id: id,
        name: name,
        description: desc,
        short: AppState.editingTemplateId && (window.BentoStorage.getTemplateById(AppState.editingTemplateId) || {}).short,
        exercises: window._tplEditingExercises,
      };

      if (!window.BentoStorage.saveTemplate(tpl)) {
        alert('Не удалось сохранить программу. Проверьте доступность хранилища устройства.');
        return;
      }
      this.closeTemplateEditorModal();
      this.renderTemplates();
      this.renderHomeBento();
      this.showToast(`Сохранено: ${name}`);
    },

    deleteTemplateFromEditor: function () {
      if (!AppState.editingTemplateId) return;
      if (confirm('Удалить эту тренировку?')) {
        if (!window.BentoStorage.deleteTemplate(AppState.editingTemplateId)) {
          alert('Не удалось удалить программу. Проверьте доступность хранилища устройства.');
          return;
        }
        this.closeTemplateEditorModal();
        this.renderTemplates();
        this.renderHomeBento();
        this.showToast('Тренировка удалена');
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

      window._schedEditingSequence = [...(sched.sequence || ['REST'])];
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

      const templates = window.BentoStorage.getAllTemplates();

      container.innerHTML = window._schedEditingSequence.map((slotVal, idx) => {
        return `
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="small muted" style="flex: none; width: 52px;">День ${idx + 1}</span>
            <select class="search-input sched-slot-select" data-idx="${idx}" style="flex: 1; min-width: 0;">
              <option value="REST" ${slotVal === 'REST' ? 'selected' : ''}>Отдых</option>
              ${templates.map((t) => `<option value="${this.escapeHtml(t.id)}" ${slotVal === t.id ? 'selected' : ''}>${this.escapeHtml(t.name)}</option>`).join('')}
            </select>
            ${window._schedEditingSequence.length > 2 ? `
              <button class="icon-btn btn-sm btn-del-sched-slot" data-idx="${idx}" style="color: var(--danger);">✕</button>
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
        sequence: window._schedEditingSequence || ['REST'],
      };

      if (!window.BentoStorage.saveSchedule(newSched)) {
        alert('Не удалось сохранить расписание. Проверьте доступность хранилища устройства.');
        return;
      }
      this.closeScheduleConfigModal();
      this.renderTemplates();
      this.renderHomeBento();
      this.showToast('План сохранён');
    },

    categoryLabel: function (category) {
      const names = { chest: 'Грудь', back: 'Спина', legs: 'Ноги', shoulders: 'Плечи', arms: 'Руки', core: 'Кор', cardio: 'Кардио' };
      return names[category] || category || '';
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
