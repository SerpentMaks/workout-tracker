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
    theme: 'dark', // 'dark' or 'light'
    accent: 'violet', // 'violet', 'cyan', 'emerald', 'coral', 'rose', 'amber'
    soundEnabled: true,
    vibrationEnabled: true,
  };

  const DEFAULT_TEMPLATES = [
    {
      id: 'tpl_push',
      name: 'Push: Грудь, Плечи и Трицепс',
      description: 'Базовая силовая программа для жимовых мышечных групп.',
      exercises: [
        {
          exerciseId: 'ex_bench_press',
          targetSets: 4,
          targetWeight: 70,
          targetReps: 8,
          progressionWeight: '+2.5 кг',
          progressionReps: 'до 10 повт',
        },
        {
          exerciseId: 'ex_incline_db_press',
          targetSets: 3,
          targetWeight: 24,
          targetReps: 10,
          progressionWeight: '+1-2 кг',
          progressionReps: 'до 12 повт',
        },
        {
          exerciseId: 'ex_overhead_press',
          targetSets: 3,
          targetWeight: 45,
          targetReps: 8,
          progressionWeight: '+1.5 кг',
          progressionReps: 'до 10 повт',
        },
        {
          exerciseId: 'ex_lateral_raises',
          targetSets: 3,
          targetWeight: 10,
          targetReps: 12,
          progressionWeight: '+0.5 кг',
          progressionReps: 'до 15 повт',
        },
        {
          exerciseId: 'ex_tricep_pushdown',
          targetSets: 3,
          targetWeight: 30,
          targetReps: 12,
          progressionWeight: '+2 кг',
          progressionReps: 'до 14 повт',
        },
      ],
    },
    {
      id: 'tpl_pull',
      name: 'Pull: Спина, Задняя дельта и Бицепс',
      description: 'Тяговая тренировка для развития толщины и ширины спины.',
      exercises: [
        {
          exerciseId: 'ex_deadlift',
          targetSets: 3,
          targetWeight: 100,
          targetReps: 6,
          progressionWeight: '+5 кг',
          progressionReps: 'до 8 повт',
        },
        {
          exerciseId: 'ex_pullups',
          targetSets: 4,
          targetWeight: 0,
          targetReps: 8,
          progressionWeight: '+2.5 кг',
          progressionReps: 'до 10 повт',
        },
        {
          exerciseId: 'ex_barbell_row',
          targetSets: 3,
          targetWeight: 65,
          targetReps: 10,
          progressionWeight: '+2.5 кг',
          progressionReps: 'до 12 повт',
        },
        {
          exerciseId: 'ex_rear_delt_flyes',
          targetSets: 3,
          targetWeight: 12,
          targetReps: 12,
          progressionWeight: '+1 кг',
          progressionReps: 'до 15 повт',
        },
        {
          exerciseId: 'ex_barbell_curl',
          targetSets: 3,
          targetWeight: 35,
          targetReps: 10,
          progressionWeight: '+1.5 кг',
          progressionReps: 'до 12 повт',
        },
      ],
    },
    {
      id: 'tpl_legs_core',
      name: 'Legs & Core: Ноги и Мышцы кора',
      description: 'Интенсивный день нижней части тела и стабилизаторов корпуса.',
      exercises: [
        {
          exerciseId: 'ex_squat',
          targetSets: 4,
          targetWeight: 85,
          targetReps: 8,
          progressionWeight: '+2.5 кг',
          progressionReps: 'до 10 повт',
        },
        {
          exerciseId: 'ex_romanian_deadlift',
          targetSets: 3,
          targetWeight: 75,
          targetReps: 10,
          progressionWeight: '+2.5 кг',
          progressionReps: 'до 12 повт',
        },
        {
          exerciseId: 'ex_leg_press',
          targetSets: 3,
          targetWeight: 150,
          targetReps: 10,
          progressionWeight: '+5 кг',
          progressionReps: 'до 12 повт',
        },
        {
          exerciseId: 'ex_hanging_leg_raises',
          targetSets: 3,
          targetWeight: 0,
          targetReps: 12,
          progressionWeight: 'без веса',
          progressionReps: 'до 15 повт',
        },
        {
          exerciseId: 'ex_plank',
          targetSets: 3,
          targetWeight: 0,
          targetReps: 60,
          progressionWeight: '+10 сек',
          progressionReps: 'до 90 сек',
        },
      ],
    },
  ];

  const DEFAULT_SCHEDULE = {
    startDate: '2026-10-01',
    intervalDays: 1, // days of rest between workouts (or sequence)
    sequence: ['tpl_push', 'REST', 'tpl_pull', 'REST', 'tpl_legs_core', 'REST', 'REST'],
  };

  const DEFAULT_METRICS = {
    height: 178, // cm
    logs: [
      { id: 'm_1', date: '2026-09-15', weight: 79.5 },
      { id: 'm_2', date: '2026-09-22', weight: 79.0 },
      { id: 'm_3', date: '2026-09-29', weight: 78.4 },
      { id: 'm_4', date: '2026-10-02', weight: 78.1 },
    ],
  };

  // Seed sample history for immediate analytics & previous sets lookup
  const DEFAULT_HISTORY = [
    {
      id: 'hist_1',
      title: 'Push: Грудь, Плечи и Трицепс',
      templateId: 'tpl_push',
      date: '2026-09-27T17:30:00.000Z',
      durationSeconds: 3120, // 52 min
      totalTonnage: 4320,
      totalSets: 16,
      completedSets: 16,
      exercises: [
        {
          exerciseId: 'ex_bench_press',
          name: 'Жим штанги лёжа',
          category: 'chest',
          progressionWeight: '+2.5 кг',
          progressionReps: 'до 10 повт',
          sets: [
            { setNumber: 1, weight: 67.5, reps: 8, completed: true },
            { setNumber: 2, weight: 67.5, reps: 8, completed: true },
            { setNumber: 3, weight: 67.5, reps: 8, completed: true },
            { setNumber: 4, weight: 67.5, reps: 7, completed: true },
          ],
        },
        {
          exerciseId: 'ex_incline_db_press',
          name: 'Жим гантелей на наклонной скамье',
          category: 'chest',
          progressionWeight: '+1-2 кг',
          progressionReps: 'до 12 повт',
          sets: [
            { setNumber: 1, weight: 22, reps: 10, completed: true },
            { setNumber: 2, weight: 22, reps: 10, completed: true },
            { setNumber: 3, weight: 22, reps: 9, completed: true },
          ],
        },
        {
          exerciseId: 'ex_overhead_press',
          name: 'Армейский жим стоя',
          category: 'shoulders',
          progressionWeight: '+1.5 кг',
          progressionReps: 'до 10 повт',
          sets: [
            { setNumber: 1, weight: 42.5, reps: 8, completed: true },
            { setNumber: 2, weight: 42.5, reps: 8, completed: true },
            { setNumber: 3, weight: 42.5, reps: 7, completed: true },
          ],
        },
        {
          exerciseId: 'ex_lateral_raises',
          name: 'Махи гантелями через стороны',
          category: 'shoulders',
          progressionWeight: '+0.5 кг',
          progressionReps: 'до 15 повт',
          sets: [
            { setNumber: 1, weight: 10, reps: 12, completed: true },
            { setNumber: 2, weight: 10, reps: 12, completed: true },
            { setNumber: 3, weight: 10, reps: 11, completed: true },
          ],
        },
        {
          exerciseId: 'ex_tricep_pushdown',
          name: 'Разгибание рук на блоке книзу',
          category: 'arms',
          progressionWeight: '+2 кг',
          progressionReps: 'до 14 повт',
          sets: [
            { setNumber: 1, weight: 28, reps: 12, completed: true },
            { setNumber: 2, weight: 28, reps: 12, completed: true },
            { setNumber: 3, weight: 28, reps: 12, completed: true },
          ],
        },
      ],
    },
    {
      id: 'hist_2',
      title: 'Pull: Спина, Задняя дельта и Бицепс',
      templateId: 'tpl_pull',
      date: '2026-09-29T18:15:00.000Z',
      durationSeconds: 3480, // 58 min
      totalTonnage: 5180,
      totalSets: 16,
      completedSets: 16,
      exercises: [
        {
          exerciseId: 'ex_deadlift',
          name: 'Становая тяга',
          category: 'back',
          progressionWeight: '+5 кг',
          progressionReps: 'до 8 повт',
          sets: [
            { setNumber: 1, weight: 95, reps: 6, completed: true },
            { setNumber: 2, weight: 95, reps: 6, completed: true },
            { setNumber: 3, weight: 95, reps: 6, completed: true },
          ],
        },
        {
          exerciseId: 'ex_pullups',
          name: 'Подтягивания широким хватом',
          category: 'back',
          progressionWeight: '+2.5 кг',
          progressionReps: 'до 10 повт',
          sets: [
            { setNumber: 1, weight: 0, reps: 8, completed: true },
            { setNumber: 2, weight: 0, reps: 8, completed: true },
            { setNumber: 3, weight: 0, reps: 7, completed: true },
            { setNumber: 4, weight: 0, reps: 6, completed: true },
          ],
        },
        {
          exerciseId: 'ex_barbell_row',
          name: 'Тяга штанги в наклоне',
          category: 'back',
          progressionWeight: '+2.5 кг',
          progressionReps: 'до 12 повт',
          sets: [
            { setNumber: 1, weight: 62.5, reps: 10, completed: true },
            { setNumber: 2, weight: 62.5, reps: 10, completed: true },
            { setNumber: 3, weight: 62.5, reps: 9, completed: true },
          ],
        },
        {
          exerciseId: 'ex_rear_delt_flyes',
          name: 'Разведение гантелей в наклоне',
          category: 'shoulders',
          progressionWeight: '+1 кг',
          progressionReps: 'до 15 повт',
          sets: [
            { setNumber: 1, weight: 10, reps: 12, completed: true },
            { setNumber: 2, weight: 10, reps: 12, completed: true },
            { setNumber: 3, weight: 10, reps: 12, completed: true },
          ],
        },
        {
          exerciseId: 'ex_barbell_curl',
          name: 'Подъём штанги на бицепс',
          category: 'arms',
          progressionWeight: '+1.5 кг',
          progressionReps: 'до 12 повт',
          sets: [
            { setNumber: 1, weight: 32.5, reps: 10, completed: true },
            { setNumber: 2, weight: 32.5, reps: 10, completed: true },
            { setNumber: 3, weight: 32.5, reps: 9, completed: true },
          ],
        },
      ],
    },
    {
      id: 'hist_3',
      title: 'Legs & Core: Ноги и Мышцы кора',
      templateId: 'tpl_legs_core',
      date: '2026-10-01T18:00:00.000Z',
      durationSeconds: 3240, // 54 min
      totalTonnage: 6850,
      totalSets: 17,
      completedSets: 17,
      exercises: [
        {
          exerciseId: 'ex_squat',
          name: 'Приседания со штангой',
          category: 'legs',
          progressionWeight: '+2.5 кг',
          progressionReps: 'до 10 повт',
          sets: [
            { setNumber: 1, weight: 80, reps: 8, completed: true },
            { setNumber: 2, weight: 80, reps: 8, completed: true },
            { setNumber: 3, weight: 80, reps: 8, completed: true },
            { setNumber: 4, weight: 80, reps: 8, completed: true },
          ],
        },
        {
          exerciseId: 'ex_romanian_deadlift',
          name: 'Румынская тяга со штангой',
          category: 'legs',
          progressionWeight: '+2.5 кг',
          progressionReps: 'до 12 повт',
          sets: [
            { setNumber: 1, weight: 70, reps: 10, completed: true },
            { setNumber: 2, weight: 70, reps: 10, completed: true },
            { setNumber: 3, weight: 70, reps: 10, completed: true },
          ],
        },
        {
          exerciseId: 'ex_leg_press',
          name: 'Жим ногами в тренажёре',
          category: 'legs',
          progressionWeight: '+5 кг',
          progressionReps: 'до 12 повт',
          sets: [
            { setNumber: 1, weight: 140, reps: 10, completed: true },
            { setNumber: 2, weight: 140, reps: 10, completed: true },
            { setNumber: 3, weight: 140, reps: 10, completed: true },
          ],
        },
        {
          exerciseId: 'ex_hanging_leg_raises',
          name: 'Подъёмы ног в висе',
          category: 'core',
          progressionWeight: 'без веса',
          progressionReps: 'до 15 повт',
          sets: [
            { setNumber: 1, weight: 0, reps: 12, completed: true },
            { setNumber: 2, weight: 0, reps: 12, completed: true },
            { setNumber: 3, weight: 0, reps: 10, completed: true },
          ],
        },
        {
          exerciseId: 'ex_plank',
          name: 'Планка классическая',
          category: 'core',
          progressionWeight: '+10 сек',
          progressionReps: 'до 90 сек',
          sets: [
            { setNumber: 1, weight: 0, reps: 60, completed: true },
            { setNumber: 2, weight: 0, reps: 50, completed: true },
            { setNumber: 3, weight: 0, reps: 45, completed: true },
          ],
        },
      ],
    },
  ];

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
      } catch (e) {
        console.error('Error writing to localStorage', key, e);
      }
    },

    // Exercises
    getExercises: function () {
      let exs = this.get(STORAGE_KEYS.EXERCISES, null);
      if (!exs || !Array.isArray(exs) || exs.length === 0) {
        exs = window.DEFAULT_EXERCISES || [];
        this.set(STORAGE_KEYS.EXERCISES, exs);
      }
      return exs;
    },
    saveExercises: function (exercises) {
      this.set(STORAGE_KEYS.EXERCISES, exercises);
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
      this.saveExercises(all);
    },
    deleteExercise: function (id) {
      const all = this.getExercises().filter((e) => e.id !== id);
      this.saveExercises(all);
    },

    // Templates
    getTemplates: function () {
      let tpls = this.get(STORAGE_KEYS.TEMPLATES, null);
      if (!tpls || !Array.isArray(tpls) || tpls.length === 0) {
        tpls = DEFAULT_TEMPLATES;
        this.set(STORAGE_KEYS.TEMPLATES, tpls);
      }
      return tpls;
    },
    saveTemplates: function (templates) {
      this.set(STORAGE_KEYS.TEMPLATES, templates);
    },
    getTemplateById: function (id) {
      const all = this.getTemplates();
      return all.find((t) => t.id === id) || null;
    },
    saveTemplate: function (template) {
      const all = this.getTemplates();
      const idx = all.findIndex((t) => t.id === template.id);
      if (idx >= 0) {
        all[idx] = template;
      } else {
        all.push(template);
      }
      this.saveTemplates(all);
    },
    deleteTemplate: function (id) {
      const all = this.getTemplates().filter((t) => t.id !== id);
      this.saveTemplates(all);
    },

    // Schedule
    getSchedule: function () {
      let sched = this.get(STORAGE_KEYS.SCHEDULE, null);
      if (!sched) {
        sched = DEFAULT_SCHEDULE;
        this.set(STORAGE_KEYS.SCHEDULE, sched);
      }
      return sched;
    },
    saveSchedule: function (schedule) {
      this.set(STORAGE_KEYS.SCHEDULE, schedule);
    },

    // History
    getHistory: function () {
      let hist = this.get(STORAGE_KEYS.HISTORY, null);
      if (!hist || !Array.isArray(hist)) {
        hist = DEFAULT_HISTORY;
        this.set(STORAGE_KEYS.HISTORY, hist);
      }
      return hist;
    },
    saveHistory: function (history) {
      this.set(STORAGE_KEYS.HISTORY, history);
    },
    addWorkoutToHistory: function (workout) {
      const hist = this.getHistory();
      hist.unshift(workout);
      this.saveHistory(hist);
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
            // Return representative or top set
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
      this.set(STORAGE_KEYS.ACTIVE_WORKOUT, workout);
    },
    clearActiveWorkout: function () {
      try {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      } catch (e) {
        console.error('Error removing active workout', e);
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
      this.set(STORAGE_KEYS.BODY_METRICS, metrics);
    },
    addWeightLog: function (weight, dateStr) {
      const metrics = this.getBodyMetrics();
      const date = dateStr || new Date().toISOString().split('T')[0];
      metrics.logs.push({
        id: 'm_' + Date.now(),
        date: date,
        weight: parseFloat(weight),
      });
      metrics.logs.sort((a, b) => new Date(a.date) - new Date(b.date));
      this.saveBodyMetrics(metrics);
      return metrics;
    },
    deleteWeightLog: function (id) {
      const metrics = this.getBodyMetrics();
      metrics.logs = metrics.logs.filter((l) => l.id !== id);
      this.saveBodyMetrics(metrics);
      return metrics;
    },

    // Settings
    getSettings: function () {
      const s = this.get(STORAGE_KEYS.SETTINGS, {});
      return Object.assign({}, DEFAULT_SETTINGS, s);
    },
    saveSettings: function (settings) {
      const current = this.getSettings();
      const merged = Object.assign({}, current, settings);
      this.set(STORAGE_KEYS.SETTINGS, merged);
      return merged;
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
        for (const item of list) {
          if (!item.id || !item.name) continue;
          const idx = merged.findIndex((e) => e.id === item.id);
          if (idx >= 0) {
            merged[idx] = item;
          } else {
            merged.push(item);
          }
        }
        this.saveExercises(merged);
        return { success: true, count: list.length };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
  };
})();
