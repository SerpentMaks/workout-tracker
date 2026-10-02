// BentoFit Analytics, Calendar & History Engine
(function () {
  let calendarYear = new Date().getFullYear();
  let calendarMonth = new Date().getMonth(); // 0-11
  let selectedDate = null; // YYYY-MM-DD

  window.BentoAnalytics = {
    getYear: () => calendarYear,
    getMonth: () => calendarMonth,
    getSelectedDate: () => selectedDate,

    setMonthOffset: function (delta) {
      calendarMonth += delta;
      if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
      } else if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
      }
    },

    setSelectedDate: function (dateStr) {
      selectedDate = dateStr;
    },

    // Global Stats Calculation
    getGlobalStats: function () {
      const history = window.BentoStorage.getHistory();
      const settings = window.BentoStorage.getSettings();
      const unit = settings.unit || 'kg';

      const totalWorkouts = history.length;
      let totalKgTonnage = 0;
      let lastWorkout = history.length > 0 ? history[0] : null;

      history.forEach((w) => {
        if (w.totalTonnage) {
          totalKgTonnage += w.totalTonnage;
        } else if (w.exercises) {
          let wTon = 0;
          w.exercises.forEach((ex) => {
            if (ex.sets) {
              ex.sets.forEach((s) => {
                if (s.completed && s.weight && s.reps) {
                  wTon += s.weight * s.reps;
                }
              });
            }
          });
          totalKgTonnage += wTon;
        }
      });

      // Weekly Goal Calculations (Monday to Sunday)
      const now = new Date();
      const currentDay = now.getDay(); // 0 is Sun, 1 is Mon...
      const distanceToMon = (currentDay + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - distanceToMon);
      monday.setHours(0, 0, 0, 0);

      const nextMonday = new Date(monday);
      nextMonday.setDate(monday.getDate() + 7);

      const thisWeekWorkouts = history.filter((w) => {
        const d = new Date(w.date);
        return d >= monday && d < nextMonday;
      });

      const weeklyCompleted = thisWeekWorkouts.length;
      const weeklyGoal = settings.weeklyGoal || 3;
      const weeklyPercent = Math.min(100, Math.round((weeklyCompleted / weeklyGoal) * 100));

      const displayTonnage = unit === 'lbs'
        ? Math.round(totalKgTonnage * 2.20462)
        : Math.round(totalKgTonnage);

      return {
        totalWorkouts,
        totalTonnage: displayTonnage,
        unit,
        weeklyCompleted,
        weeklyGoal,
        weeklyPercent,
        lastWorkout,
      };
    },

    // Get workouts for specific date (YYYY-MM-DD)
    getWorkoutsForDate: function (dateStr) {
      const history = window.BentoStorage.getHistory();
      return history.filter((w) => {
        const wDate = new Date(w.date).toISOString().split('T')[0];
        return wDate === dateStr;
      });
    },

    // Check which days in current calendar month have workouts
    getMonthWorkoutDatesMap: function () {
      const history = window.BentoStorage.getHistory();
      const map = {};
      history.forEach((w) => {
        const d = new Date(w.date);
        if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
          const dateStr = d.toISOString().split('T')[0];
          map[dateStr] = (map[dateStr] || 0) + 1;
        }
      });
      return map;
    },

    // Render interactive calendar grid HTML
    renderCalendarHTML: function () {
      const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
      ];
      const workoutMap = this.getMonthWorkoutDatesMap();

      const firstDay = new Date(calendarYear, calendarMonth, 1);
      const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
      const totalDays = lastDay.getDate();

      // Monday = 0, Sunday = 6
      let startDayOfWeek = (firstDay.getDay() + 6) % 7;

      const todayStr = new Date().toISOString().split('T')[0];

      let html = `
        <div class=\"cal-header\">
          <button class=\"cal-nav-btn\" id=\"cal-prev-btn\" aria-label=\"Предыдущий месяц\">
            <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\"><polyline points=\"15 18 9 12 15 6\"/></svg>
          </button>
          <span class=\"cal-title\">${monthNames[calendarMonth]} ${calendarYear}</span>
          <button class=\"cal-nav-btn\" id=\"cal-next-btn\" aria-label=\"Следующий месяц\">
            <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\"><polyline points=\"9 18 15 12 9 6\"/></svg>
          </button>
        </div>
        <div class=\"cal-weekdays\">
          <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
        </div>
        <div class=\"cal-grid\">
      `;

      // Empty padding days
      for (let i = 0; i < startDayOfWeek; i++) {
        html += `<div class=\"cal-day empty\"></div>`;
      }

      // Days of month
      for (let day = 1; day <= totalDays; day++) {
        const mStr = (calendarMonth + 1).toString().padStart(2, '0');
        const dStr = day.toString().padStart(2, '0');
        const fullDateStr = `${calendarYear}-${mStr}-${dStr}`;

        const isToday = fullDateStr === todayStr;
        const isSelected = fullDateStr === selectedDate;
        const hasWorkouts = !!workoutMap[fullDateStr];

        let classes = ['cal-day'];
        if (isToday) classes.push('is-today');
        if (isSelected) classes.push('is-selected');
        if (hasWorkouts) classes.push('has-workout');

        html += `
          <button class=\"${classes.join(' ')}\" data-date=\"${fullDateStr}\">
            <span class=\"cal-day-num\">${day}</span>
            ${hasWorkouts ? '<span class=\"cal-dot\"></span>' : ''}
          </button>
        `;
      }

      html += `</div>`;
      return html;
    },
  };
})();
