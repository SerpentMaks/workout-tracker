// Ready-made programs. A program is a rotation of day templates that plugs into the schedule engine.
(function () {
  const REST = 'REST';

  // Rep range → starting reps, progression hints for the tracker.
  function item(row) {
    const exerciseId = row[0];
    const range = row[2];
    const nums = String(range).match(/\d+/g).map(Number);
    const low = nums[0];
    const high = nums[nums.length - 1];
    const timed = /с$/.test(range);
    return {
      exerciseId: exerciseId,
      targetSets: row[1],
      targetWeight: 0,
      targetReps: Math.round((low + high) / 2),
      repRange: range,
      restSeconds: row[3],
      group: row[4] || null,
      progressionWeight: timed ? '' : 'Вес вверх, когда все подходы дошли до верха диапазона',
      progressionReps: timed ? `до ${high} сек` : `до ${high} повт`,
    };
  }

  function day(id, name, short, description, rows) {
    return { id: id, name: name, short: short, description: description, isLibrary: true, exercises: rows.map(item) };
  }

  const T = [
    // ---- Масса: фулбади
    day('lib_fb_a', 'Всё тело A', 'Тело A', 'Присед, жим лёжа и тяга', [
      ['ex_squat', 4, '6–10', 150], ['ex_bench_press', 4, '6–10', 150], ['ex_barbell_row', 3, '8–12', 120],
      ['ex_lateral_raises', 3, '12–20', 60], ['ex_incline_curl', 2, '10–15', 75], ['ex_overhead_triceps_ext', 2, '10–15', 75],
    ]),
    day('lib_fb_b', 'Всё тело B', 'Тело B', 'Задняя цепь, жим вверх и вертикальная тяга', [
      ['ex_romanian_deadlift', 3, '8–12', 150], ['ex_seated_db_press', 3, '8–12', 120], ['ex_lat_pulldown', 3, '8–12', 120],
      ['ex_pec_deck', 3, '12–15', 60], ['ex_leg_extension', 3, '10–15', 75], ['ex_seated_leg_curl', 2, '10–15', 75], ['ex_calf_raises', 3, '10–15', 60],
    ]),
    day('lib_fb_c', 'Всё тело C', 'Тело C', 'Ягодицы, наклонный жим и горизонтальная тяга', [
      ['ex_hip_thrust', 3, '8–12', 120], ['ex_leg_press', 3, '10–15', 120], ['ex_incline_db_press', 3, '8–12', 120],
      ['ex_seated_cable_row', 3, '8–12', 120], ['ex_lateral_raises', 3, '12–20', 60], ['ex_hammer_curls', 2, '10–15', 60], ['ex_tricep_pushdown', 2, '10–15', 60],
    ]),
    // ---- Масса: верх / низ
    day('lib_ul_u1', 'Верх 1: тяжёлый', 'Верх 1', 'Жим и тяга в 6–10 повторах', [
      ['ex_bench_press', 4, '6–10', 150], ['ex_barbell_row', 4, '6–10', 150], ['ex_seated_db_press', 3, '8–12', 120],
      ['ex_lat_pulldown', 3, '8–12', 90], ['ex_lateral_raises', 3, '12–20', 60],
      ['ex_incline_curl', 2, '10–15', 60, 'A'], ['ex_overhead_triceps_ext', 2, '10–15', 75, 'A'],
    ]),
    day('lib_ul_l1', 'Низ 1: приседания', 'Низ 1', 'Акцент на переднюю поверхность бедра', [
      ['ex_squat', 4, '6–10', 180], ['ex_romanian_deadlift', 3, '8–10', 150], ['ex_leg_extension', 3, '10–15', 90],
      ['ex_seated_leg_curl', 3, '10–15', 90], ['ex_calf_raises', 4, '10–15', 60],
    ]),
    day('lib_ul_u2', 'Верх 2: объём', 'Верх 2', 'Наклонный жим, подтягивания и изоляция', [
      ['ex_incline_db_press', 4, '8–12', 120], ['ex_pullups', 4, '6–10', 150], ['ex_chest_supported_row', 3, '8–12', 90],
      ['ex_pec_deck', 2, '12–15', 60], ['ex_bent_arm_lateral', 3, '12–20', 60], ['ex_face_pull', 2, '12–20', 60],
      ['ex_hammer_curls', 2, '10–15', 60, 'A'], ['ex_tricep_pushdown', 2, '10–15', 75, 'A'],
    ]),
    day('lib_ul_l2', 'Низ 2: ягодицы', 'Низ 2', 'Ягодичный мост и работа на одну ногу', [
      ['ex_hip_thrust', 4, '8–12', 120], ['ex_bulgarian_split_squat', 3, '8–12', 90], ['ex_leg_press', 3, '10–15', 120],
      ['ex_seated_leg_curl', 3, '10–15', 90], ['ex_calf_raises', 4, '10–15', 60], ['ex_hanging_leg_raises', 3, '8–15', 60],
    ]),
    // ---- Масса: тяни-толкай-ноги
    day('lib_ppl_push1', 'Толкай 1', 'Толкай 1', 'Грудь, плечи и трицепс', [
      ['ex_bench_press', 4, '6–10', 150], ['ex_seated_db_press', 3, '8–12', 120], ['ex_incline_db_press', 3, '8–12', 120],
      ['ex_lateral_raises', 4, '12–20', 60], ['ex_overhead_triceps_ext', 3, '10–15', 75],
    ]),
    day('lib_ppl_pull1', 'Тяни 1', 'Тяни 1', 'Спина, задняя дельта и бицепс', [
      ['ex_pullups', 4, '6–10', 150], ['ex_barbell_row', 3, '8–12', 120], ['ex_seated_cable_row', 3, '10–12', 90],
      ['ex_rear_delt_flyes', 3, '12–20', 60], ['ex_incline_curl', 3, '10–15', 60],
    ]),
    day('lib_ppl_legs1', 'Ноги 1', 'Ноги 1', 'Присед и задняя поверхность', [
      ['ex_squat', 4, '6–10', 180], ['ex_romanian_deadlift', 3, '8–12', 150], ['ex_leg_extension', 3, '10–15', 90],
      ['ex_seated_leg_curl', 3, '10–15', 90], ['ex_calf_raises', 4, '10–15', 60],
    ]),
    day('lib_ppl_push2', 'Толкай 2', 'Толкай 2', 'Наклонный жим и объём на плечи', [
      ['ex_incline_db_press', 4, '8–12', 120], ['ex_dips', 3, '6–12', 120], ['ex_overhead_press', 3, '6–10', 150],
      ['ex_pec_deck', 3, '12–15', 60], ['ex_bent_arm_lateral', 4, '12–20', 60], ['ex_tricep_pushdown', 3, '10–15', 60],
    ]),
    day('lib_ppl_pull2', 'Тяни 2', 'Тяни 2', 'Ширина спины и бицепс', [
      ['ex_lat_pulldown', 4, '8–12', 120], ['ex_chest_supported_row', 3, '8–12', 90], ['ex_single_arm_db_row', 3, '8–12', 75],
      ['ex_face_pull', 3, '12–20', 60], ['ex_barbell_curl', 3, '8–12', 75], ['ex_hammer_curls', 2, '10–15', 60],
    ]),
    day('lib_ppl_legs2', 'Ноги 2', 'Ноги 2', 'Ягодичный мост и одна нога', [
      ['ex_hip_thrust', 4, '8–12', 120], ['ex_bulgarian_split_squat', 3, '8–12', 90], ['ex_leg_press', 3, '10–15', 120],
      ['ex_seated_leg_curl', 3, '10–15', 90], ['ex_calf_raises', 4, '10–15', 60], ['ex_hanging_leg_raises', 3, '8–15', 60],
    ]),
    // ---- Масса: пары мышц
    day('lib_pair_cb', 'Грудь + спина', 'Грудь + спина', 'Суперсеты: подход на грудь, сразу подход на спину', [
      ['ex_bench_press', 4, '6–10', 45, 'A'], ['ex_barbell_row', 4, '6–10', 120, 'A'],
      ['ex_incline_db_press', 3, '8–12', 45, 'B'], ['ex_lat_pulldown', 3, '8–12', 120, 'B'],
      ['ex_pec_deck', 3, '12–15', 30, 'C'], ['ex_seated_cable_row', 3, '10–12', 90, 'C'],
      ['ex_incline_curl', 2, '10–15', 30, 'D'], ['ex_overhead_triceps_ext', 2, '10–15', 75, 'D'],
    ]),
    day('lib_pair_ls', 'Ноги + плечи', 'Ноги + плечи', 'Сначала ноги, потом свежие плечи', [
      ['ex_squat', 4, '6–10', 180], ['ex_romanian_deadlift', 3, '8–12', 150], ['ex_leg_extension', 2, '10–15', 75], ['ex_seated_leg_curl', 3, '10–15', 75],
      ['ex_seated_db_press', 3, '8–12', 120], ['ex_lateral_raises', 4, '12–20', 60], ['ex_rear_delt_flyes', 3, '12–20', 60], ['ex_calf_raises', 3, '10–15', 60],
    ]),
    day('lib_trio_ct', 'Грудь + трицепс', 'Грудь + трицепс', 'Все жимовые в один день', [
      ['ex_bench_press', 4, '6–10', 150], ['ex_incline_db_press', 3, '8–12', 120], ['ex_pec_deck', 3, '12–15', 60],
      ['ex_overhead_triceps_ext', 3, '10–15', 75], ['ex_tricep_pushdown', 2, '10–15', 60],
    ]),
    day('lib_trio_bb', 'Спина + бицепс', 'Спина + бицепс', 'Все тяговые в один день', [
      ['ex_pullups', 4, '6–10', 150], ['ex_barbell_row', 3, '8–12', 120], ['ex_seated_cable_row', 3, '10–12', 90],
      ['ex_incline_curl', 3, '10–15', 60], ['ex_hammer_curls', 2, '10–15', 60],
    ]),
    // ---- Похудение
    day('lib_fat_a', 'Сила A', 'Сила A', 'Базовые движения, тяжело и без спешки', [
      ['ex_squat', 3, '6–10', 150], ['ex_bench_press', 3, '6–10', 150], ['ex_barbell_row', 3, '8–12', 120], ['ex_side_plank', 2, '30–45 с', 45],
    ]),
    day('lib_fat_b', 'Сила B', 'Сила B', 'Задняя цепь и вертикальные движения', [
      ['ex_romanian_deadlift', 3, '8–12', 150], ['ex_seated_db_press', 3, '8–12', 120], ['ex_lat_pulldown', 3, '8–12', 120], ['ex_lunges', 2, '10–12', 90],
    ]),
    day('lib_ss_up', 'Верх: суперсеты', 'Верх', 'Антагонисты парами: больше работы за меньшее время', [
      ['ex_incline_db_press', 3, '8–12', 30, 'A'], ['ex_seated_cable_row', 3, '8–12', 90, 'A'],
      ['ex_seated_db_press', 3, '8–12', 30, 'B'], ['ex_lat_pulldown', 3, '8–12', 90, 'B'],
      ['ex_incline_curl', 2, '10–15', 30, 'C'], ['ex_tricep_pushdown', 2, '10–15', 60, 'C'],
    ]),
    day('lib_ss_low', 'Низ: суперсеты', 'Низ', 'Передняя и задняя поверхность бедра парами', [
      ['ex_goblet_squat', 3, '10–12', 30, 'A'], ['ex_seated_leg_curl', 3, '10–15', 90, 'A'],
      ['ex_bulgarian_split_squat', 3, '8–12', 30, 'B'], ['ex_hip_thrust', 3, '8–12', 90, 'B'],
      ['ex_calf_raises', 3, '10–15', 30, 'C'], ['ex_plank', 3, '30–60 с', 60, 'C'],
    ]),
    day('lib_hiit', 'Интервалы', 'Интервалы', '8 ускорений: 30 секунд работы, 60–90 секунд легко', [['ex_hiit_bike', 8, '30 с', 75]]),
    day('lib_walk', 'Ходьба в гору', 'Ходьба', '30–40 минут в разговорном темпе', [['ex_incline_walk', 1, '1800–2400 с', 0]]),
    day('lib_circuit_a', 'Круг A', 'Круг A', 'По кругу без пауз, отдых 2 минуты после круга', [
      ['ex_goblet_squat', 3, '10–15', 0, 'A'], ['ex_pushups', 3, '8–15', 0, 'A'], ['ex_single_arm_db_row', 3, '10–12', 0, 'A'],
      ['ex_kettlebell_swing', 3, '15–20', 0, 'A'], ['ex_plank', 3, '30–45 с', 120, 'A'],
    ]),
    day('lib_circuit_b', 'Круг B', 'Круг B', 'По кругу без пауз, отдых 2 минуты после круга', [
      ['ex_lunges', 3, '10–12', 0, 'A'], ['ex_seated_db_press', 3, '10–12', 0, 'A'], ['ex_lat_pulldown', 3, '10–12', 0, 'A'],
      ['ex_glute_bridge', 3, '12–20', 0, 'A'], ['ex_mountain_climbers', 3, '30–40 с', 120, 'A'],
    ]),
    // ---- Сила
    day('lib_str_a', 'Сила: присед и жим', 'Присед', 'Тяжёлые подходы и длинный отдых', [
      ['ex_squat', 4, '3–6', 210], ['ex_bench_press', 4, '3–6', 210], ['ex_barbell_row', 3, '6–8', 150], ['ex_plank', 2, '45–60 с', 60],
    ]),
    day('lib_str_b', 'Сила: тяга и жим вверх', 'Тяга', 'Тяжёлые подходы и длинный отдых', [
      ['ex_deadlift', 3, '3–5', 240], ['ex_overhead_press', 4, '3–6', 180], ['ex_pullups', 4, '4–8', 150], ['ex_hanging_leg_raises', 2, '8–12', 60],
    ]),
    day('lib_str_c', 'Сила: присед и объём', 'Объём', 'Те же движения в чуть большем числе повторов', [
      ['ex_squat', 3, '5–8', 180], ['ex_bench_press', 3, '5–8', 180], ['ex_hip_thrust', 3, '6–10', 120], ['ex_chinups', 3, '5–8', 150],
    ]),
    // ---- Дом: резина
    day('lib_band_a', 'Резина A', 'Резина A', 'Только эластичные ленты и дверной упор', [
      ['ex_band_squat', 5, '12–20', 75], ['ex_band_chest_press', 4, '10–20', 75], ['ex_band_row', 4, '10–20', 75],
      ['ex_band_lateral_raise', 3, '15–25', 45], ['ex_band_curl', 3, '12–20', 45], ['ex_band_overhead_ext', 3, '12–20', 45],
    ]),
    day('lib_band_b', 'Резина B', 'Резина B', 'Задняя цепь, спина сверху и кор', [
      ['ex_band_rdl', 4, '12–20', 75], ['ex_band_pulldown', 4, '10–20', 75], ['ex_band_chest_press', 3, '10–20', 75], ['ex_band_hip_thrust', 3, '15–25', 60],
      ['ex_band_leg_curl', 3, '12–20', 45], ['ex_band_face_pull', 3, '15–25', 45], ['ex_band_pallof', 3, '10–15', 45],
    ]),
    // ---- Дом: полный набор
    day('lib_kit_u1', 'Дом: верх 1', 'Верх 1', 'Турник, брусья и упоры', [
      ['ex_pullups', 4, '5–12', 120], ['ex_dips', 4, '6–15', 120], ['ex_handle_pushups', 3, '8–20', 75],
      ['ex_band_row', 3, '12–20', 60], ['ex_band_lateral_raise', 4, '15–25', 45], ['ex_band_curl', 3, '12–20', 45],
    ]),
    day('lib_kit_l1', 'Дом: низ 1', 'Низ 1', 'Одна нога, резина и пресс на турнике', [
      ['ex_bulgarian_split_squat', 4, '8–15', 90], ['ex_band_rdl', 4, '12–20', 75], ['ex_band_leg_curl', 3, '12–20', 60],
      ['ex_calf_raises', 4, '12–20', 45], ['ex_hanging_knee_raise', 3, '10–15', 60],
    ]),
    day('lib_kit_u2', 'Дом: верх 2', 'Верх 2', 'Обратный хват, плечи и горизонтальная тяга', [
      ['ex_chinups', 4, '5–12', 120], ['ex_pike_pushups', 3, '6–12', 90], ['ex_decline_pushups', 3, '8–15', 75],
      ['ex_inverted_row', 3, '8–15', 75], ['ex_band_pull_apart', 3, '15–25', 45], ['ex_band_overhead_ext', 3, '12–20', 45],
    ]),
    day('lib_kit_l2', 'Дом: низ 2', 'Низ 2', 'Ягодицы и квадрицепс в большом числе повторов', [
      ['ex_band_squat', 4, '12–20', 75], ['ex_single_leg_bridge', 4, '10–15', 60], ['ex_lunges', 3, '10–15', 60],
      ['ex_calf_raises', 4, '12–20', 45], ['ex_l_sit', 3, '10–20 с', 60],
    ]),
    // ---- Дом: турник и брусья
    day('lib_bars_a', 'Турник и брусья A', 'Бары A', 'Вертикальная тяга и жим', [
      ['ex_pullups', 4, '5–12', 120], ['ex_dips', 4, '6–15', 120], ['ex_inverted_row', 3, '8–15', 75],
      ['ex_pike_pushups', 3, '6–12', 90], ['ex_air_squat', 4, '15–30', 60], ['ex_single_leg_bridge', 3, '10–15', 60], ['ex_hanging_knee_raise', 3, '10–15', 60],
    ]),
    day('lib_bars_b', 'Турник и брусья B', 'Бары B', 'Обратный хват, плечи и ноги', [
      ['ex_chinups', 4, '5–12', 120], ['ex_pike_pushups', 4, '6–12', 90], ['ex_decline_pushups', 3, '8–15', 75],
      ['ex_bulgarian_split_squat', 4, '8–15', 75], ['ex_l_sit', 3, '10–20 с', 60],
    ]),
    // ---- Дом: без инвентаря
    day('lib_bw_a', 'Без инвентаря A', 'Тело A', 'Нужен только пол и стул', [
      ['ex_pushups', 4, '8–25', 75], ['ex_inverted_row', 4, '6–15', 75], ['ex_bulgarian_split_squat', 4, '8–15', 75],
      ['ex_glute_bridge', 3, '15–25', 60], ['ex_side_plank', 3, '30–45 с', 45],
    ]),
    day('lib_bw_b', 'Без инвентаря B', 'Тело B', 'Нужен только пол и стул', [
      ['ex_pike_pushups', 4, '6–12', 75], ['ex_inverted_row', 4, '6–15', 75], ['ex_lunges', 4, '10–15', 75],
      ['ex_single_leg_bridge', 3, '10–15', 60], ['ex_decline_pushups', 3, '8–15', 60], ['ex_bird_dog', 3, '8–12', 45],
    ]),
    // ---- Дом: похудение
    day('lib_home_fat_a', 'Дома: круг A', 'Круг A', 'По кругу без пауз, отдых 2 минуты после круга', [
      ['ex_air_squat', 4, '15–25', 0, 'A'], ['ex_pushups', 4, '8–20', 0, 'A'], ['ex_band_row', 4, '12–20', 0, 'A'],
      ['ex_mountain_climbers', 4, '30–40 с', 120, 'A'],
    ]),
    day('lib_home_fat_b', 'Дома: круг B', 'Круг B', 'По кругу без пауз, отдых 2 минуты после круга', [
      ['ex_lunges', 4, '10–15', 0, 'A'], ['ex_band_chest_press', 4, '12–20', 0, 'A'], ['ex_band_pulldown', 4, '12–20', 0, 'A'],
      ['ex_burpee', 4, '8–12', 0, 'A'], ['ex_jump_rope', 4, '30–45 с', 120, 'A'],
    ]),
    // ---- Новичкам
    day('lib_new_a', 'Первая тренировка A', 'День A', 'Тренажёры и понятная техника', [
      ['ex_leg_press', 3, '10–15', 120], ['ex_pec_deck', 3, '10–15', 90], ['ex_lat_pulldown', 3, '10–15', 90],
      ['ex_seated_leg_curl', 2, '10–15', 75], ['ex_lateral_raises', 2, '12–20', 60], ['ex_plank', 2, '20–40 с', 45],
    ]),
    day('lib_new_b', 'Первая тренировка B', 'День B', 'Свободные веса в простом варианте', [
      ['ex_goblet_squat', 3, '10–15', 120], ['ex_pushups', 3, '6–15', 90], ['ex_seated_cable_row', 3, '10–15', 90],
      ['ex_leg_extension', 2, '10–15', 75], ['ex_face_pull', 2, '12–20', 60], ['ex_dead_bug', 2, '8–12', 45],
    ]),
    day('lib_new_home', 'Старт дома', 'Старт', 'Одна резина и коврик', [
      ['ex_air_squat', 3, '10–20', 75], ['ex_band_chest_press', 3, '10–15', 75], ['ex_band_row', 3, '10–15', 75],
      ['ex_glute_bridge', 3, '12–20', 60], ['ex_band_pull_apart', 2, '15–20', 45], ['ex_dead_bug', 2, '8–12', 45],
    ]),
  ];

  // goal: mass, fat, strength, home, beginner
  const P = [
    {
      id: 'prog_upper_lower', goal: 'mass', name: 'Верх / низ', days: 4, level: 'Средний', place: 'Зал',
      recommended: true,
      sequence: ['lib_ul_u1', 'lib_ul_l1', REST, 'lib_ul_u2', 'lib_ul_l2', REST, REST],
      why: 'Каждая мышца работает дважды в неделю и набирает больше 10 подходов. Лучший баланс объёма и времени.',
      sources: ['volume', 'frequency', 'splits'],
    },
    {
      id: 'prog_full_body', goal: 'mass', name: 'Всё тело', days: 3, level: 'Любой', place: 'Зал',
      sequence: ['lib_fb_a', REST, 'lib_fb_b', REST, 'lib_fb_c', REST, REST],
      why: 'Три похода в зал дают тот же рост, что и сплит, если объём одинаковый. Подходит, когда времени мало.',
      sources: ['splits', 'volume'],
    },
    {
      id: 'prog_ppl', goal: 'mass', name: 'Тяни, толкай, ноги', days: 6, level: 'Опытный', place: 'Зал',
      sequence: ['lib_ppl_push1', 'lib_ppl_pull1', 'lib_ppl_legs1', 'lib_ppl_push2', 'lib_ppl_pull2', 'lib_ppl_legs2', REST],
      why: 'Больше всего объёма. Рост с объёмом продолжается, но отдача падает: брать только если хватает сна и восстановления.',
      sources: ['volume', 'pelland'],
    },
    {
      id: 'prog_pairs', goal: 'mass', name: 'Пары: грудь + спина, ноги + плечи', days: 5, level: 'Средний', place: 'Зал',
      sequence: ['lib_pair_cb', 'lib_pair_ls', REST],
      why: 'Суперсеты груди со спиной экономят время и не снижают рост. Ноги и плечи почти не мешают друг другу. Исследований именно этой пары нет: это логика, а не доказанный факт.',
      sources: ['supersets', 'frequency'],
    },
    {
      id: 'prog_trio', goal: 'mass', name: 'Грудь + трицепс, спина + бицепс, ноги + плечи', days: 5, level: 'Средний', place: 'Зал',
      sequence: ['lib_trio_ct', 'lib_trio_bb', 'lib_pair_ls', REST],
      why: 'Цикл из 4 дней, поэтому каждая группа работает почти дважды в неделю, а не один раз, как в классическом сплите.',
      sources: ['frequency', 'splits'],
    },
    {
      id: 'prog_fat_strength', goal: 'fat', name: 'Сила и шаги', days: 3, level: 'Любой', place: 'Зал',
      recommended: true,
      sequence: ['lib_fat_a', REST, 'lib_fat_b', REST, 'lib_fat_a', REST, REST],
      why: 'На диете силовые берегут мышцы. Держите дефицит меньше 500 ккал в день и белок около 1,6 г/кг, а в остальные дни просто ходите.',
      sources: ['villareal', 'deficit', 'protein'],
    },
    {
      id: 'prog_fat_mix', goal: 'fat', name: 'Суперсеты и кардио', days: 4, level: 'Средний', place: 'Зал',
      sequence: ['lib_ss_up', 'lib_hiit', REST, 'lib_ss_low', 'lib_walk', REST, REST],
      why: 'Сочетание силовых и кардио дало лучший результат по функции у сидящих на диете. Интервалы и ходьба сжигают жир одинаково, выбирайте по времени.',
      sources: ['villareal', 'wewege', 'supersets'],
    },
    {
      id: 'prog_fat_circuit', goal: 'fat', name: 'Круговая на 30 минут', days: 3, level: 'Любой', place: 'Зал',
      sequence: ['lib_circuit_a', REST, 'lib_circuit_b', REST, 'lib_circuit_a', REST, REST],
      why: 'Вариант на случай нехватки времени. Для роста мышц отдых дольше 60 секунд всё же немного лучше, поэтому это план про экономию времени.',
      sources: ['rest', 'supersets'],
    },
    {
      id: 'prog_strength', goal: 'strength', name: 'Три дня базы', days: 3, level: 'Средний', place: 'Зал',
      recommended: true,
      sequence: ['lib_str_a', REST, 'lib_str_b', REST, 'lib_str_c', REST, REST],
      why: 'Сила растёт от тяжёлых весов и частой практики самого движения, поэтому присед и жим стоят два раза в неделю.',
      sources: ['loads', 'pelland'],
    },
    {
      id: 'prog_home_kit', goal: 'home', name: 'Резина, упоры, турник, брусья', days: 4, level: 'Средний', place: 'Дом',
      recommended: true,
      sequence: ['lib_kit_u1', 'lib_kit_l1', REST, 'lib_kit_u2', 'lib_kit_l2', REST, REST],
      why: 'Весь домашний набор в формате верх и низ. Доводите подходы близко к отказу: при малом весе рост зависит именно от этого.',
      sources: ['loads', 'bands', 'pushups'],
      kit: ['band', 'handles', 'pullbar', 'dipbars'],
    },
    {
      id: 'prog_home_band', goal: 'home', name: 'Только резина', days: 3, level: 'Любой', place: 'Дом',
      sequence: ['lib_band_a', REST, 'lib_band_b', REST, 'lib_band_a', REST, REST],
      why: 'Обзор 8 исследований не нашёл разницы в приросте силы между резиной и обычными весами. Берите ленту, которая даёт отказ в указанном диапазоне.',
      sources: ['bands'],
      kit: ['band'],
    },
    {
      id: 'prog_home_bars', goal: 'home', name: 'Турник и брусья', days: 3, level: 'Средний', place: 'Дом',
      sequence: ['lib_bars_a', REST, 'lib_bars_b', REST, 'lib_bars_a', REST, REST],
      why: 'Подтягивания нагружают широчайшие выше 100% от максимального изометрического усилия. Когда станет легко, добавьте рюкзак с весом.',
      sources: ['pullups', 'pushups'],
      kit: ['pullbar', 'dipbars'],
    },
    {
      id: 'prog_home_bw', goal: 'home', name: 'Без инвентаря', days: 3, level: 'Любой', place: 'Дом',
      sequence: ['lib_bw_a', REST, 'lib_bw_b', REST, 'lib_bw_a', REST, REST],
      why: 'Отжимания при равной нагрузке растят грудь как жим лёжа. Слабое место плана: спину нечем тяжело нагрузить, нужен стол для горизонтальных подтягиваний.',
      sources: ['pushups', 'loads'],
      kit: ['none'],
    },
    {
      id: 'prog_home_fat', goal: 'home', name: 'Похудение дома', days: 3, level: 'Любой', place: 'Дом',
      sequence: ['lib_home_fat_a', REST, 'lib_home_fat_b', REST, 'lib_home_fat_a', REST, REST],
      why: 'Круговая с резиной и кардио-движениями. Главным для жира остаётся питание: дефицит меньше 500 ккал в день.',
      sources: ['deficit', 'bands', 'protein'],
      kit: ['band', 'none'],
    },
    {
      id: 'prog_beginner', goal: 'beginner', name: 'Первые 8 недель', days: 2, level: 'Новичок', place: 'Зал',
      recommended: true,
      sequence: ['lib_new_a', REST, REST, 'lib_new_b', REST, REST, REST],
      why: 'Два дня и простая техника. Отказ не обязателен, оставляйте 1–2 повтора в запасе. На третий месяц переходите на «Всё тело».',
      sources: ['failure', 'frequency'],
    },
    {
      id: 'prog_beginner_home', goal: 'beginner', name: 'Старт дома', days: 3, level: 'Новичок', place: 'Дом',
      sequence: ['lib_new_home', REST, 'lib_new_home', REST, 'lib_new_home', REST, REST],
      why: 'Одна тренировка, которую легко запомнить. Когда верх диапазона даётся легко, берите более жёсткую ленту.',
      sources: ['bands', 'failure'],
      kit: ['band'],
    },
  ];

  const GOALS = [
    { id: 'mass', name: 'Масса', plate: 'red', kg: 25, intro: 'Больше 10 подходов на мышцу в неделю, два раза в неделю, и сплит можно выбирать под свой график.' },
    { id: 'fat', name: 'Похудение', plate: 'yellow', kg: 15, intro: 'Жир уходит от дефицита калорий, а силовые на диете сохраняют мышцы. Кардио добавляйте после них.' },
    { id: 'strength', name: 'Сила', plate: 'blue', kg: 20, intro: 'Тяжёлые веса, длинный отдых и частая практика одних и тех же движений.' },
    { id: 'home', name: 'Дома', plate: 'green', kg: 10, intro: 'Резина, упоры, турник и брусья. Лёгкие подходы работают, если доводить их близко к отказу.' },
    { id: 'beginner', name: 'Новичкам', plate: 'white', kg: 5, intro: 'Два–три дня, простая техника и запас в 1–2 повтора.' },
  ];

  // Short claims, each checked against the linked paper or its abstract.
  const SOURCES = {
    volume: { title: 'Больше подходов — больше рост', text: 'Рост мышц зависит от объёма. Ниже 5 подходов в неделю он заметно хуже, чем при 10 и выше.', cite: 'Schoenfeld и соавт., 2017', url: 'https://pubmed.ncbi.nlm.nih.gov/27433992/' },
    pelland: { title: 'Отдача от объёма падает', text: 'Анализ 67 исследований: и сила, и размер растут с объёмом, но для силы отдача падает гораздо быстрее. Частота важна для силы, почти не влияет на размер при равном объёме.', cite: 'Pelland и соавт., 2026', url: 'https://sportrxiv.org/index.php/server/preprint/view/460' },
    frequency: { title: 'Два раза в неделю лучше одного', text: 'При равном объёме 2 тренировки мышцы в неделю дают больше роста, чем одна. Преимущество 3 раз над 2 не доказано.', cite: 'Schoenfeld и соавт., 2016', url: 'https://pubmed.ncbi.nlm.nih.gov/27102172/' },
    splits: { title: 'Сплит не решает', text: '14 исследований: при равном объёме сплит и всё тело не отличаются ни по силе, ни по размеру. Выбирайте то, что удобно.', cite: 'Ramos-Campo и соавт., 2024', url: 'https://pubmed.ncbi.nlm.nih.gov/38595233/' },
    supersets: { title: 'Суперсеты экономят время', text: '19 исследований: рост и сила как при обычных подходах, а тренировка короче. Пары антагонистов лучше сохраняют объём, чем пары на одну мышцу.', cite: 'Обзор 2025 года', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12011898/' },
    failure: { title: 'Отказ почти ничего не добавляет', text: 'Подход до отказа даёт лишь незначительное преимущество в росте по сравнению с подходом без отказа.', cite: 'Refalo и соавт., 2023', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9935748/' },
    rest: { title: 'Отдых дольше минуты', text: 'Небольшое преимущество в росте при отдыхе больше 60 секунд.', cite: 'Singer и соавт., 2024', url: 'https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1429789/pdf' },
    loads: { title: 'Вес влияет на силу, а не на размер', text: 'Рост мышц одинаков при лёгких и тяжёлых весах, а максимальная сила лучше растёт от тяжёлых.', cite: 'Lopez и соавт., 2021', url: 'https://pubmed.ncbi.nlm.nih.gov/33433148/' },
    deficit: { title: 'Дефицит меньше 500 ккал', text: 'На диете сила растёт как обычно, а набор мышц страдает. Дефицит около 500 ккал в день уже мешает приросту сухой массы.', cite: 'Murphy и Koehler, 2022', url: 'https://read.qxmd.com/read/34623696/energy-deficiency-impairs-resistance-training-gains-in-lean-mass-but-not-strength-a-meta-analysis-and-meta-regression' },
    villareal: { title: 'Диета с силовыми', text: 'У пожилых людей на диете силовые и комбинированный план сохранили больше мышц, чем только кардио: потери 2–3% против 5%. На молодых результат может отличаться.', cite: 'Villareal и соавт., NEJM, 2017', url: 'https://pubmed.ncbi.nlm.nih.gov/28514618/' },
    wewege: { title: 'Интервалы экономят время', text: 'Интервалы и ровное кардио снижают жир одинаково, но интервалы требуют примерно на 40% меньше времени.', cite: 'Wewege и соавт., 2017', url: 'https://researchers.mq.edu.au/en/publications/high-intensity-interval-training-vs-moderate-intensity-continuous/' },
    protein: { title: 'Белок около 1,6 г/кг', text: 'Выше примерно 1,6 г на кг веса добавки белка уже не увеличивают прирост мышц, хотя точная граница неопределённа.', cite: 'Morton и соавт., 2018', url: 'https://bjsm.bmj.com/content/52/6/376.abstract' },
    bands: { title: 'Резина работает', text: '8 исследований: эластичные ленты дают такой же прирост силы, как тренажёры и свободные веса. Данные о росте мышц скромнее.', cite: 'Lopes и соавт., 2019', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6383082/' },
    pushups: { title: 'Отжимания равны лёгкому жиму', text: 'При одинаковой нагрузке отжимания растят грудь и трицепс как жим лёжа с 40% от максимума. Выборка маленькая.', cite: 'Kikuchi и Nakazato, 2017', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5812864' },
    pullups: { title: 'Подтягивания и хват', text: 'Широчайшие работают очень сильно при любом хвате. Обратный хват добавляет бицепс и грудь, прямой — нижнюю трапецию.', cite: 'Youdas и соавт., 2010', url: 'https://pubmed.ncbi.nlm.nih.gov/21068680/' },
    ace_chest: { title: 'Сравнение упражнений на грудь', text: 'Лучше всего: жим штанги, бабочка (98%) и кроссовер с наклоном (93%). Отжимания дали наименьшую активацию из проверенных. Исследование ЭМГ, а не роста мышц.', cite: 'ACE, 2012', url: 'https://www.acefitness.org/certifiednewsarticle/2884/ace-sponsored-research-top-3-most-effective-chest-exercises/' },
    ace_delt: { title: 'Сравнение упражнений на плечи', text: 'Ни одно упражнение не нагружает все три пучка сразу, поэтому в программах их несколько.', cite: 'ACE, 2012', url: 'https://www.acefitness.org/resources/pros/expert-articles/9074/smart-shoulder-solutions-an-evidence-based-approach-to-training-the-deltoids/' },
    plotkin: { title: 'Ягодичный мост против приседаний', text: 'За 9 недель ягодицы выросли одинаково, а бедро сильнее от приседаний. ЭМГ не предсказала рост мышц.', cite: 'Plotkin и соавт., 2023', url: 'https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2023.1279170/full' },
    maeo2021: { title: 'Сгибания сидя против лёжа', text: 'Сидя бицепс бедра вырос сильнее, чем лёжа.', cite: 'Maeo и соавт., 2021', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Maeo+hamstrings+seated+prone+leg+curl' },
    maeo2022: { title: 'Трицепс из-за головы', text: 'Разгибания из-за головы дали примерно на 40% больше роста, чем на верхнем блоке. 21 человек, но более раннее исследование разницы не нашло.', cite: 'Maeo и соавт., 2022', url: 'https://informahealthcare.com/doi/full/10.1080/17461391.2022.2100279' },
    pedrosa: { title: 'Разгибания ног в растяжении', text: 'Работа в растянутой части амплитуды дала больший рост квадрицепса, чем в укороченной.', cite: 'Pedrosa и соавт., 2022', url: 'https://researchgate.net/profile/Gustavo-Pedrosa/publication/351538891_Partial_range_of_motion_training_elicits_favorable_improvements_in_muscular_adaptations_when_carried_out_at_long_muscle_lengths/links/61f1e6bbc5e3103375c2e9f9/Partial-range-of-motion-training-elicits-favorable-improvements-in-muscular-adaptations-when-carried-out-at-long-muscle-lengths.pdf' },
    kinoshita: { title: 'Икры стоя против сидя', text: 'Стоя икры выросли в 2,7 раза сильнее, чем сидя.', cite: 'Kinoshita и соавт., 2023', url: 'https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2023.1272106/full' },
    kikuchi: { title: 'Отжимания против жима', text: 'Одинаковый рост груди и трицепса при равной нагрузке. По 9 нетренированных мужчин в группе.', cite: 'Kikuchi и Nakazato, 2017', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5812864' },
    calatayud: { title: 'Отжимания с резиной', text: 'Жим лёжа и отжимания с резиной при сравнимой активации мышц дали схожий прирост силы.', cite: 'Calatayud и соавт., 2015', url: 'https://producciocientifica.uv.es/documentos/5ef106d0299952068d595025' },
    lopes: { title: 'Резина против весов', text: 'Нет превосходства ни резины, ни обычных весов в приросте силы.', cite: 'Lopes и соавт., 2019', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6383082/' },
    youdas: { title: 'Подтягивания и хват', text: 'Обратный хват сильнее включает бицепс и грудь, прямой — нижнюю трапецию.', cite: 'Youdas и соавт., 2010', url: 'https://pubmed.ncbi.nlm.nih.gov/21068680/' },
    mcgill: { title: 'Упражнения на кор', text: 'Измерение мышечной активности и движения позвоночника в планках и «птице-собаке».', cite: 'McGill и соавт., 2009', url: 'https://www.backfitpro.com/medical-scientific-articles/2009/[90]McGill,S.(2009)Exercises-for-spine-stabilization[Arch.Phys.Med.and-Rehab.].pdf' },
    wolf: { title: 'Работа в растяжении', text: 'Обзор 8 исследований: тренировка в длинном положении мышцы может давать больше роста, но эффект пока не отделить от объёма работы.', cite: 'Wolf и соавт., 2026', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12869050' },
  };

  window.BENTO_LIBRARY = {
    templates: T,
    programs: P,
    goals: GOALS,
    sources: SOURCES,
    principles: ['volume', 'frequency', 'splits', 'pelland', 'supersets', 'failure', 'rest', 'loads', 'deficit', 'villareal', 'wewege', 'protein', 'bands'],
  };
})();
