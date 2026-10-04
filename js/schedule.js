// BentoFit Interval Schedule & Cycle Engine
(function () {
  window.BentoSchedule = {
    // Calculates status for a given target date (defaults to today)
    getScheduleForDate: function (targetDateObj) {
      const scheduleConfig = window.BentoStorage.getSchedule();
      const target = targetDateObj ? new Date(targetDateObj) : new Date();
      target.setHours(0, 0, 0, 0);

      const startDateParts = String(scheduleConfig.startDate || '2026-10-01').split('-').map(Number);
      const start = new Date(startDateParts[0], startDateParts[1] - 1, startDateParts[2]);
      start.setHours(0, 0, 0, 0);

      const targetDay = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
      const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      const diffDays = Math.floor((targetDay - startDay) / (1000 * 60 * 60 * 24));

      const baseSequence = (scheduleConfig.sequence && scheduleConfig.sequence.length > 0)
        ? scheduleConfig.sequence
        : ['tpl_push', 'REST', 'tpl_pull', 'REST', 'tpl_legs_core', 'REST', 'REST'];
      const intervalDays = Math.max(1, Math.min(30, parseInt(scheduleConfig.intervalDays, 10) || 1));
      const sequence = baseSequence.flatMap((item) => (
        item === 'REST' ? Array(intervalDays).fill('REST') : [item]
      ));

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
