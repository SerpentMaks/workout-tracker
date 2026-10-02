// BentoFit Interval Schedule & Cycle Engine
(function () {
  window.BentoSchedule = {
    // Calculates status for a given target date (defaults to today)
    getScheduleForDate: function (targetDateObj) {
      const scheduleConfig = window.BentoStorage.getSchedule();
      const target = targetDateObj ? new Date(targetDateObj) : new Date();
      target.setHours(0, 0, 0, 0);

      const start = new Date(scheduleConfig.startDate || '2026-10-01');
      start.setHours(0, 0, 0, 0);

      const diffTime = target.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const sequence = (scheduleConfig.sequence && scheduleConfig.sequence.length > 0)
        ? scheduleConfig.sequence
        : ['tpl_push', 'REST', 'tpl_pull', 'REST', 'tpl_legs_core', 'REST', 'REST'];

      const cycleLength = sequence.length;
      // Handle past/future modulo safely
      let seqIndex = ((diffDays % cycleLength) + cycleLength) % cycleLength;

      const item = sequence[seqIndex];
      const isRest = item === 'REST' || !item;

      let template = null;
      if (!isRest) {
        template = window.BentoStorage.getTemplateById(item);
      }

      // Find next workout if today is rest
      let daysUntilNext = 0;
      let nextTemplate = null;
      for (let i = 1; i <= cycleLength; i++) {
        const nextIdx = (seqIndex + i) % cycleLength;
        const nextItem = sequence[nextIdx];
        if (nextItem !== 'REST' && nextItem) {
          daysUntilNext = i;
          nextTemplate = window.BentoStorage.getTemplateById(nextItem);
          break;
        }
      }

      return {
        targetDate: target,
        diffDays: diffDays,
        cycleDay: seqIndex + 1,
        cycleTotalDays: cycleLength,
        isRest: isRest,
        template: template,
        daysUntilNext: daysUntilNext,
        nextTemplate: nextTemplate,
        sequence: sequence,
      };
    },

    getTodaySchedule: function () {
      return this.getScheduleForDate(new Date());
    },
  };
})();
