// BentoFit Storage & State Management
(function () {
  const STORAGE_KEYS = {
    EXERCISES: 'bentofit_exercises_v1',
    TEMPLATES: 'bentofit_templates_v1',
    SCHEDULE: 'bentofit_schedule_v1',
    HISTORY: 'bentofit_history_v1',
    ACTIVE_WORKOUT: 'bentofit_active_workout_v1',
    BODY_METRICS: 'bentofit_body_metrics_v1',
    SETTINGS: 'bentofit_settings_v1',
  };

  const DEFAULT_SETTINGS = {
    unit: 'kg', // 'kg' or 'lbs'
    weeklyGoal: 3, // 1 to 14
    defaultRestSeconds: 90, // 15 to 600
    theme: 'dark', // 'dark', 'light' or 'system'
    accent: 'amber', // plate colour: 'amber', 'coral', 'cyan', 'emerald', 'white'
    soundEnabled: true,
    vibrationEnabled: true,
  };

  // Accent colours from before the plate palette
  const LEGACY_ACCENTS = { violet: 'amber', rose: 'coral' };

  function defaultSchedule() {
    const now = new Date();
    const program = (window.BENTO_LIBRARY.programs || []).find((p) => p.id === 'prog_upper_lower');
    return {
      startDate: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`,
      intervalDays: 1,
      sequence: program ? program.sequence.slice() : ['REST'],
      programId: program ? program.id : null,
    };
  }

  let exerciseCache = { raw: undefined, list: null };

  const DEFAULT_METRICS = {
    height: 178, // cm
    logs: [],
  };

  // Start with clean empty history (no fake workouts)
  const DEFAULT_HISTORY = [];

  window.BentoStorage = {
    // Generic read/write helpers
    get: function (key, defaultValue) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('Error reading from localStorage', key, e);
        return defaultValue;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Error writing to localStorage', key, e);
        return false;
      }
    },

    // Exercises
    // Built-in exercises always come from the app so text and drawings stay current;
    // only exercises the user added are read from storage.
    getExercises: function () {
      let raw = null;
      try {
        raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      } catch (e) {
        console.error('Error reading exercises', e);
      }
      if (exerciseCache.list && exerciseCache.raw === raw) return exerciseCache.list;

      const defaults = window.DEFAULT_EXERCISES || [];
      const builtInIds = new Set(defaults.map((e) => e.id));
      let stored = [];
      try {
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) stored = parsed;
      } catch (e) {
        console.error('Error parsing exercises', e);
      }
      const list = defaults.concat(stored.filter((e) => e && !builtInIds.has(e.id)));
      exerciseCache = { raw: raw, list: list };
      return list;
    },
    saveExercises: function (exercises) {
      return this.set(STORAGE_KEYS.EXERCISES, exercises);
    },
    getExerciseById: function (id) {
      const all = this.getExercises();
      return all.find((e) => e.id === id) || null;
    },
    saveExercise: function (exercise) {
      const all = this.getExercises();
      const idx = all.findIndex((e) => e.id === exercise.id);
      if (idx >= 0) {
        all[idx] = exercise;
      } else {
        all.push(exercise);
      }
      return this.saveExercises(all);
    },
    deleteExercise: function (id) {
      const all = this.getExercises().filter((e) => e.id !== id);
      return this.saveExercises(all);
    },

    // Templates
    // Saved by the user. A library day edited by the user is saved here under the same id and wins over the original.
    getTemplates: function () {
      const tpls = this.get(STORAGE_KEYS.TEMPLATES, []);
      return Array.isArray(tpls) ? tpls : [];
    },
    getAllTemplates: function () {
      const mine = this.getTemplates();
      const mineIds = new Set(mine.map((t) => t.id));
      return mine.concat(window.BENTO_LIBRARY.templates.filter((t) => !mineIds.has(t.id)));
    },
    saveTemplates: function (templates) {
      return this.set(STORAGE_KEYS.TEMPLATES, templates);
    },
    getTemplateById: function (id) {
      return this.getAllTemplates().find((t) => t.id === id) || null;
    },
    saveTemplate: function (template) {
      const all = this.getTemplates();
      const idx = all.findIndex((t) => t.id === template.id);
      if (idx >= 0) {
        all[idx] = template;
      } else {
        all.push(template);
      }
      return this.saveTemplates(all);
    },
    deleteTemplate: function (id) {
      const all = this.getTemplates().filter((t) => t.id !== id);
      return this.saveTemplates(all);
    },

    // Schedule
    getSchedule: function () {
      let sched = this.get(STORAGE_KEYS.SCHEDULE, null);
      if (!sched) {
        sched = defaultSchedule();
        this.set(STORAGE_KEYS.SCHEDULE, sched);
      }
      return sched;
    },
    saveSchedule: function (schedule) {
      return this.set(STORAGE_KEYS.SCHEDULE, schedule);
    },

    // History (Clean empty start, purge legacy sample workouts)
    getHistory: function () {
      let hist = this.get(STORAGE_KEYS.HISTORY, null);
      if (!hist || !Array.isArray(hist)) {
        hist = DEFAULT_HISTORY;
        this.set(STORAGE_KEYS.HISTORY, hist);
      }
      // Purge any dummy seed items from earlier test runs
      const cleaned = hist.filter((w) => w.id !== 'hist_1' && w.id !== 'hist_2' && w.id !== 'hist_3');
      if (cleaned.length !== hist.length) {
        hist = cleaned;
        this.set(STORAGE_KEYS.HISTORY, hist);
      }
      return hist;
    },
    saveHistory: function (history) {
      return this.set(STORAGE_KEYS.HISTORY, history);
    },
    addWorkoutToHistory: function (workout) {
      const hist = this.getHistory();
      const existingIdx = hist.findIndex((item) => item.id === workout.id);
      if (existingIdx >= 0) {
        hist[existingIdx] = workout;
      } else {
        hist.unshift(workout);
      }
      return this.saveHistory(hist);
    },
    getWorkoutById: function (id) {
      return this.getHistory().find((w) => w.id === id) || null;
    },

    // Find previous performance for an exercise
    getLastPerformanceForExercise: function (exerciseId) {
      const hist = this.getHistory();
      for (const workout of hist) {
        if (!workout.exercises) continue;
        const found = workout.exercises.find((e) => e.exerciseId === exerciseId);
        if (found && found.sets && found.sets.length > 0) {
          const compSets = found.sets.filter((s) => s.completed);
          if (compSets.length > 0) {
            return {
              date: workout.date,
              workoutTitle: workout.title,
              bestSet: compSets.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), compSets[0]),
              lastSet: compSets[compSets.length - 1],
              allCompletedSets: compSets,
            };
          }
        }
      }
      return null;
    },

    // Get exercise history across all workouts
    getExerciseHistoryList: function (exerciseId) {
      const hist = this.getHistory();
      const results = [];
      for (const workout of hist) {
        if (!workout.exercises) continue;
        const found = workout.exercises.find((e) => e.exerciseId === exerciseId);
        if (found && found.sets) {
          const comp = found.sets.filter((s) => s.completed);
          if (comp.length > 0) {
            results.push({
              date: workout.date,
              workoutTitle: workout.title,
              sets: comp,
            });
          }
        }
      }
      return results;
    },

    // Active Workout
    getActiveWorkout: function () {
      return this.get(STORAGE_KEYS.ACTIVE_WORKOUT, null);
    },
    saveActiveWorkout: function (workout) {
      return this.set(STORAGE_KEYS.ACTIVE_WORKOUT, workout);
    },
    clearActiveWorkout: function () {
      try {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
        return true;
      } catch (e) {
        console.error('Error removing active workout', e);
        return false;
      }
    },

    resetAppData: function () {
      try {
        Object.keys(STORAGE_KEYS).forEach((name) => {
          localStorage.removeItem(STORAGE_KEYS[name]);
        });
        return true;
      } catch (e) {
        console.error('Error resetting BentoFit data', e);
        return false;
      }
    },

    // Body Metrics
    getBodyMetrics: function () {
      let metrics = this.get(STORAGE_KEYS.BODY_METRICS, null);
      if (!metrics) {
        metrics = DEFAULT_METRICS;
        this.set(STORAGE_KEYS.BODY_METRICS, metrics);
      }
      return metrics;
    },
    saveBodyMetrics: function (metrics) {
      return this.set(STORAGE_KEYS.BODY_METRICS, metrics);
    },
    addWeightLog: function (weight, dateStr, height) {
      const metrics = this.getBodyMetrics();
      const now = new Date();
      const localDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const date = dateStr || localDate;
      if (Number.isFinite(height) && height > 0) {
        metrics.height = height;
      }
      metrics.logs.push({
        id: 'm_' + Date.now(),
        date: date,
        weight: parseFloat(weight),
      });
      metrics.logs.sort((a, b) => new Date(a.date) - new Date(b.date));
      return this.saveBodyMetrics(metrics) ? metrics : null;
    },
    deleteWeightLog: function (id) {
      const metrics = this.getBodyMetrics();
      metrics.logs = metrics.logs.filter((l) => l.id !== id);
      return this.saveBodyMetrics(metrics) ? metrics : null;
    },

    // Settings
    getSettings: function () {
      const s = this.get(STORAGE_KEYS.SETTINGS, {});
      const merged = Object.assign({}, DEFAULT_SETTINGS, s);
      merged.accent = LEGACY_ACCENTS[merged.accent] || merged.accent;
      return merged;
    },
    saveSettings: function (settings) {
      const current = this.getSettings();
      const merged = Object.assign({}, current, settings);
      return this.set(STORAGE_KEYS.SETTINGS, merged) ? merged : null;
    },

    // Unit conversion helpers
    convertWeight: function (valInKg, targetUnit) {
      if (valInKg === null || valInKg === undefined) return 0;
      if (targetUnit === 'lbs') {
        return Math.round(valInKg * 2.20462 * 10) / 10;
      }
      return Math.round(valInKg * 10) / 10;
    },
    toKg: function (val, fromUnit) {
      if (fromUnit === 'lbs') {
        return Math.round((val / 2.20462) * 10) / 10;
      }
      return val;
    },

    // Full Export & Import
    exportAllData: function () {
      const payload = {
        version: 1,
        appName: 'BentoFit',
        exportDate: new Date().toISOString(),
        settings: this.getSettings(),
        schedule: this.getSchedule(),
        bodyMetrics: this.getBodyMetrics(),
        templates: this.getTemplates(),
        exercises: this.getExercises(),
        history: this.getHistory(),
      };
      return JSON.stringify(payload, null, 2);
    },
    importAllData: function (jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        if (!data || typeof data !== 'object') {
          return { success: false, error: 'Неверный формат JSON файла.' };
        }
        if (data.settings) this.saveSettings(data.settings);
        if (data.schedule) this.saveSchedule(data.schedule);
        if (data.bodyMetrics) this.saveBodyMetrics(data.bodyMetrics);
        if (Array.isArray(data.templates)) this.saveTemplates(data.templates);
        if (Array.isArray(data.exercises)) this.saveExercises(data.exercises);
        if (Array.isArray(data.history)) this.saveHistory(data.history);
        return { success: true };
      } catch (e) {
        return { success: false, error: 'Ошибка парсинга JSON: ' + e.message };
      }
    },

    // Exercises Only Export & Import
    exportExercises: function () {
      return JSON.stringify(this.getExercises(), null, 2);
    },
    importExercises: function (jsonStr) {
      try {
        const list = JSON.parse(jsonStr);
        if (!Array.isArray(list)) {
          return { success: false, error: 'Ожидался массив упражнений.' };
        }
        const current = this.getExercises();
        const merged = [...current];
        let importedCount = 0;
        for (const item of list) {
          if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id.trim() || typeof item.name !== 'string' || !item.name.trim()) continue;
          const idx = merged.findIndex((e) => e.id === item.id);
          if (idx >= 0) {
            merged[idx] = item;
          } else {
            merged.push(item);
          }
          importedCount++;
        }
        if (!this.saveExercises(merged)) {
          return { success: false, error: 'Не удалось записать упражнения в хранилище.' };
        }
        return { success: true, count: importedCount };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
  };
})();
