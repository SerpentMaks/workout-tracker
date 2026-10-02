// 34 Exercises across 6 muscle groups
window.DEFAULT_EXERCISES = [
  {
    "id": "ex_bench_press",
    "name": "Жим штанги лёжа",
    "nameEn": "Barbell Bench Press",
    "category": "chest",
    "categoryName": "Грудь",
    "targetMuscles": [
      "Большая грудная",
      "Передняя дельта",
      "Трицепс"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M20,70 L80,70 M30,70 L30,85 M70,70 L70,85\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M28,66 C32,60 48,58 54,64 L66,66\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"24\" cy=\"62\" r=\"5\" fill=\"var(--accent)\"/><line x1=\"15\" y1=\"35\" x2=\"75\" y2=\"35\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"15\" cy=\"35\" r=\"7\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"75\" cy=\"35\" r=\"7\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M42,60 L40,42 L48,36 M50,60 L52,42 L48,36\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg>",
    "instructions": {
      "initial": "Лягте на скамью, сведите лопатки и прижмите ягодицы. Стопы плотно упираются в пол. Хват чуть шире плеч, закрытый.",
      "eccentric": "На вдохе подконтрольно опустите гриф к середине грудных мышц (линия сосков), удерживая локти под углом около 45-75 градусов к корпусу.",
      "concentric": "На выдохе мощным движением выжмите штангу вверх по дугообразной траектории, не отрывая таз и лопатки от скамьи.",
      "breathing": "Вдох при опускании штанги к груди, выдох на усилии при выжимании.",
      "mistakes": "Разведение локтей на 90 градусов (травма плеч), отрыв таза от скамьи, отбив грифа от грудной клетки."
    }
  },
  {
    "id": "ex_incline_db_press",
    "name": "Жим гантелей на наклонной скамье",
    "nameEn": "Incline Dumbbell Press",
    "category": "chest",
    "categoryName": "Грудь",
    "targetMuscles": [
      "Верхняя часть груди (ключичная)",
      "Передняя дельта",
      "Трицепс"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M20,80 L60,45 M35,67 L30,85 M55,50 L65,75 M60,45 L80,50\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M38,62 C45,54 52,47 62,45\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"66\" cy=\"40\" r=\"5\" fill=\"var(--accent)\"/><line x1=\"45\" y1=\"25\" x2=\"55\" y2=\"18\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"45\" cy=\"25\" r=\"4\" fill=\"var(--accent)\"/><circle cx=\"55\" cy=\"18\" r=\"4\" fill=\"var(--accent)\"/><path d=\"M48,52 L50,30 M56,48 L53,26\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg>",
    "instructions": {
      "initial": "Установите угол скамьи 30-45 градусов. Поднимите гантели к плечам, сведите лопатки, упритесь ногами в пол.",
      "eccentric": "На вдохе опускайте гантели по краям груди с комфортной растяжкой, сохраняя угол в локтях около 60-70 градусов.",
      "concentric": "На выдохе выжмите гантели вверх по сходящейся траектории, но не соударяйте их в верхней точке.",
      "breathing": "Вдох при опускании веса, выдох при подъёме.",
      "mistakes": "Слишком крутой угол скамьи (>45 градусов переносит нагрузку на дельты), избыточный прогиб поясницы."
    }
  },
  {
    "id": "ex_dips",
    "name": "Отжимания на брусьях",
    "nameEn": "Chest Dips",
    "category": "chest",
    "categoryName": "Грудь",
    "targetMuscles": [
      "Нижняя часть груди",
      "Трицепс",
      "Передняя дельта"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"25\" y1=\"55\" x2=\"75\" y2=\"55\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"25\" y1=\"55\" x2=\"25\" y2=\"85\" stroke=\"currentColor\" stroke-width=\"3\"/><line x1=\"75\" y1=\"55\" x2=\"75\" y2=\"85\" stroke=\"currentColor\" stroke-width=\"3\"/><circle cx=\"48\" cy=\"22\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M48,27 L46,45 L42,68 L36,75\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M46,35 L38,45 L38,55 M46,35 L58,45 L58,55\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Примите упор на брусьях на прямых руках. Слегка наклоните корпус вперёд (около 20-30 градусов), согните ноги в коленях.",
      "eccentric": "На вдохе плавно опускайтесь вниз за счёт сгибания рук в локтях до угла 90 градусов в плечевом суставе, локти разводите умеренно.",
      "concentric": "На выдохе мощно вытолкните корпус вверх, сокращая грудные мышцы.",
      "breathing": "Вдох на опускании, выдох при выходе наверх.",
      "mistakes": "Слишком глубокий провал (риск травмы плечевых связок), строго вертикальный корпус (смещает акцент на трицепс)."
    }
  },
  {
    "id": "ex_dumbbell_flyes",
    "name": "Разведение гантелей лёжа",
    "nameEn": "Dumbbell Flyes",
    "category": "chest",
    "categoryName": "Грудь",
    "targetMuscles": [
      "Грудные мышцы (изоляция)",
      "Передняя дельта"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M20,70 L80,70 M30,70 L30,85 M70,70 L70,85\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M35,66 C42,62 58,62 65,66\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"30\" cy=\"64\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M45,60 C32,50 25,40 22,35\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M55,60 C68,50 75,40 78,35\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"20\" cy=\"33\" r=\"5\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"80\" cy=\"33\" r=\"5\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>",
    "instructions": {
      "initial": "Лягте на горизонтальную скамью, удерживая гантели над грудью нейтральным хватом (ладони смотрят друг на друга). Локти слегка согнуты.",
      "eccentric": "На вдохе разводите руки через стороны по широкой дуге, ощущая приятное растяжение грудных мышц.",
      "concentric": "На выдохе тем же движением «обнимите дерево», сводя гантели в исходную точку за счёт грудных.",
      "breathing": "Вдох при раскрытии грудной клетки, выдох при сведении рук.",
      "mistakes": "Полное выпрямление локтей (высокая нагрузка на суставы), слишком большой вес и опускание ниже уровня скамьи."
    }
  },
  {
    "id": "ex_cable_crossover",
    "name": "Сведение рук в кроссовере",
    "nameEn": "Cable Crossover",
    "category": "chest",
    "categoryName": "Грудь",
    "targetMuscles": [
      "Внутренняя и нижняя часть груди",
      "Передняя дельта"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M15,20 L28,45 M85,20 L72,45\" stroke=\"currentColor\" stroke-width=\"2\" stroke-dasharray=\"3,3\"/><circle cx=\"50\" cy=\"35\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,40 L48,65 L43,85 M48,65 L56,85\" stroke=\"var(--accent)\" stroke-width=\"4\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M48,46 L32,52 L45,60 M48,46 L68,52 L55,60\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Встаньте по центру тренажера кроссовер, выставьте одну ногу вперед для баланса, корпус чуть наклонен вперед. Возьмите рукояти верхних блоков.",
      "eccentric": "На вдохе плавно разведите руки назад и в стороны до чувства раскрытия груди, локти держа зафиксированными.",
      "concentric": "На выдохе сведите рукояти перед собой вниз и к центру, максимально сжав грудные мышцы на пике сокращения.",
      "breathing": "Вдох на обратном движении, выдох при сведении рук.",
      "mistakes": "Помощь корпусом (раскачивание), чрезмерный сгиб локтей, превращающий сведение в жим."
    }
  },
  {
    "id": "ex_pushups",
    "name": "Отжимания от пола",
    "nameEn": "Push-ups",
    "category": "chest",
    "categoryName": "Грудь",
    "targetMuscles": [
      "Грудные мышцы",
      "Трицепсы",
      "Передние дельты",
      "Мышцы кора"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"10\" y1=\"85\" x2=\"90\" y2=\"85\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"25\" cy=\"52\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M28,55 L58,62 L82,82\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M38,58 L36,72 L32,85 M42,59 L46,72 L48,85\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Упор лёжа, ладони шире плеч на уровне груди, пальцы направлены вперёд. Тело вытянуто в единую прямую линию от макушки до пят.",
      "eccentric": "На вдохе опустите корпус до касания пола грудью, удерживая локти под углом 45 градусов к туловищу.",
      "concentric": "На выдохе динамично отожмитесь обратно в исходное положение, сохраняя пресс напряжённым.",
      "breathing": "Вдох при опускании, выдох при подъёме.",
      "mistakes": "Провисание таза в пояснице, разведение локтей перпендикулярно корпусу, неполная амплитуда."
    }
  },
  {
    "id": "ex_deadlift",
    "name": "Становая тяга",
    "nameEn": "Conventional Deadlift",
    "category": "back",
    "categoryName": "Спина",
    "targetMuscles": [
      "Разгибатели спины",
      "Широчайшие",
      "Ягодичные",
      "Бицепс бедра",
      "Трапеции"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"15\" y1=\"80\" x2=\"85\" y2=\"80\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"15\" cy=\"80\" r=\"8\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"85\" cy=\"80\" r=\"8\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"48\" cy=\"30\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M48,35 L44,52 L56,70 L54,82\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M46,42 L50,65 L50,80\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Встаньте вплотную к штанге, стопы на ширине таза. Возьмитесь за гриф хватом на ширине плеч. Спина идеально прямая, грудь расправлена.",
      "eccentric": "На вдохе подконтрольно опустите штангу вдоль бедер и голеней, отводя таз назад до касания помоста.",
      "concentric": "На выдохе отталкивайтесь ногами от пола, выпрямляя колени и корпус синхронно. В верхней точке зафиксируйтесь без переразгибания в пояснице.",
      "breathing": "Глубокий вдох в живот перед стартом (внутрибрюшное давление), выдох после преодоления мёртвой точки.",
      "mistakes": "Скругление спины («горб»), отрыв штанги от ног, резкий рывок в начале движения."
    }
  },
  {
    "id": "ex_pullups",
    "name": "Подтягивания широким хватом",
    "nameEn": "Wide-grip Pull-ups",
    "category": "back",
    "categoryName": "Спина",
    "targetMuscles": [
      "Широчайшие мышцы спины",
      "Большая круглая",
      "Бицепсы",
      "Трапеции"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"15\" y1=\"20\" x2=\"85\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\"/><circle cx=\"50\" cy=\"35\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,40 L50,62 L46,78 L44,88\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M50,45 L35,32 L28,20 M50,45 L65,32 L72,20\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Повисните на перекладине хватом шире плеч. Сведите лопатки вниз, расправьте грудь, ноги скрещены или вытянуты.",
      "eccentric": "На вдохе подконтрольно опуститесь в нижнюю точку до полного растяжения широчайших, сохраняя контроль в плечах.",
      "concentric": "На выдохе за счёт сведения лопаток и опускания локтей подтянитесь вверх до уровня подбородка выше турника.",
      "breathing": "Вдох при опускании тела, выдох при подъёме вверх.",
      "mistakes": "Рывки ногами (киппинг), неполная амплитуда, задирание плеч к ушам."
    }
  },
  {
    "id": "ex_barbell_row",
    "name": "Тяга штанги в наклоне",
    "nameEn": "Barbell Bent-over Row",
    "category": "back",
    "categoryName": "Спина",
    "targetMuscles": [
      "Широчайшие спины",
      "Ромбовидные",
      "Трапециевидная",
      "Задняя дельта"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><circle cx=\"35\" cy=\"32\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M37,37 L50,48 L52,68 L56,85\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><line x1=\"30\" y1=\"65\" x2=\"70\" y2=\"65\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"30\" cy=\"65\" r=\"7\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"70\" cy=\"65\" r=\"7\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M44,42 L46,55 L48,65\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg>",
    "instructions": {
      "initial": "Наклоните корпус вперед под углом 45-60 градусов, колени слегка согнуты, спина прямая с естественным прогибом. Гриф штанги держите хватом чуть шире плеч.",
      "eccentric": "На вдохе медленно опустите штангу вниз, растягивая широчайшие мышцы.",
      "concentric": "На выдохе тяните штангу к низу живота за счёт движения локтей назад и вверх, сводя лопатки.",
      "breathing": "Вдох при опускании снаряда, выдох на пиковом усилии тяги.",
      "mistakes": "Круглая поясница, изменение угла наклона корпуса в процессе движения (читинг), тяга руками вместо спины."
    }
  },
  {
    "id": "ex_lat_pulldown",
    "name": "Тяга верхнего блока к груди",
    "nameEn": "Lat Pulldown",
    "category": "back",
    "categoryName": "Спина",
    "targetMuscles": [
      "Широчайшие спины",
      "Бицепсы",
      "Большая круглая"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"20\" y1=\"15\" x2=\"80\" y2=\"15\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"50\" cy=\"42\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,47 L50,70 L42,88 M50,70 L58,88\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M50,52 L36,35 L26,20 M50,52 L64,35 L74,20\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Сядьте в тренажёр, зафиксируйте бедра под валиками. Возьмитесь за длинную рукоять широким хватом, слегка отклоните корпус назад.",
      "eccentric": "На вдохе плавно верните рукоять вверх, чувствуя растяжение широчайших мышц.",
      "concentric": "На выдохе мощно потяните рукоять к верхней части груди, ведя локти вниз и назад, максимально сводя лопатки.",
      "breathing": "Вдох при возврате веса, выдох при тяге рукояти к груди.",
      "mistakes": "Слишком сильное отклонение корпуса назад (превращение упражнения в горизонтальную тягу), затягивание за голову."
    }
  },
  {
    "id": "ex_seated_cable_row",
    "name": "Тяга горизонтального блока к поясу",
    "nameEn": "Seated Cable Row",
    "category": "back",
    "categoryName": "Спина",
    "targetMuscles": [
      "Середина спины",
      "Ромбовидные",
      "Широчайшие",
      "Задняя дельта"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M20,80 L75,80 M20,65 L20,85\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"62\" cy=\"45\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M62,50 L60,72 L45,78 L35,78\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M60,56 L46,60 L28,62\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M20,62 L28,62\" stroke=\"currentColor\" stroke-width=\"2\" stroke-dasharray=\"2,2\"/></svg>",
    "instructions": {
      "initial": "Сядьте на скамью, упритесь стопами в платформу, колени слегка согнуты. Возьмите V-образную рукоять, выпрямите спину.",
      "eccentric": "На вдохе позвольте блоку потянуть руки вперед с контролируемым растяжением мышц спины без скругления поясницы.",
      "concentric": "На выдохе потяните рукоять к поясу, направляя локти строго назад вдоль корпуса и сводя лопатки.",
      "breathing": "Вдох на расслаблении/растяжении, выдох при подтягивании рукояти.",
      "mistakes": "Раскачивание корпусом вперёд-назад по инерции, притягивание плеч к ушам."
    }
  },
  {
    "id": "ex_hyperextension",
    "name": "Гиперэкстензия",
    "nameEn": "Hyperextensions",
    "category": "back",
    "categoryName": "Спина",
    "targetMuscles": [
      "Разгибатели позвоночника",
      "Ягодичные мышцы",
      "Бицепс бедра"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M25,85 L55,55 L75,85 M55,55 L55,85\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"35\" cy=\"35\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M37,39 L52,52 L70,68\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Отрегулируйте тренажер так, чтобы край подушки находился чуть ниже уровня сгиба тазобедренного сустава. Пятки упираются в платформу.",
      "eccentric": "На вдохе медленно наклоните корпус вниз до угла около 90 градусов, сохраняя нейтральное положение шеи и позвоночника.",
      "concentric": "На выдохе поднимите корпус силой ягодиц и разгибателей спины до одной прямой линии с ногами.",
      "breathing": "Вдох при наклоне вниз, выдох при возвращении в нейтраль.",
      "mistakes": "Переразгибание поясницы назад выше прямой линии, резкие рывки телом."
    }
  },
  {
    "id": "ex_squat",
    "name": "Приседания со штангой",
    "nameEn": "Barbell Squat",
    "category": "legs",
    "categoryName": "Ноги",
    "targetMuscles": [
      "Квадрицепсы",
      "Ягодичные",
      "Приводящие мышцы",
      "Кор"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"20\" y1=\"32\" x2=\"80\" y2=\"32\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"20\" cy=\"32\" r=\"7\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"80\" cy=\"32\" r=\"7\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"50\" cy=\"26\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,33 L46,55 L58,68 L56,86\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Штанга лежит на трапециях, стопы на ширине плеч или чуть шире, носки слегка развернуты наружу (20-30 градусов). Взгляд направлен вперед.",
      "eccentric": "На вдохе опускайтесь в присед, отводя таз назад и разводя колени сонаправленно носкам, до параллели бедра полу или чуть ниже.",
      "concentric": "На выдохе мощно отталкивайтесь всей поверхностью стоп от пола, выпрямляя ноги без заваливания коленей внутрь.",
      "breathing": "Вдох при опускании вниз, выдох на выходе из приседа.",
      "mistakes": "Сведение коленей внутрь («X-ноги»), отрыв пяток от пола, скругление поясницы в нижней точке («клевок тазом»)."
    }
  },
  {
    "id": "ex_leg_press",
    "name": "Жим ногами в тренажёре",
    "nameEn": "Leg Press",
    "category": "legs",
    "categoryName": "Ноги",
    "targetMuscles": [
      "Квадрицепсы",
      "Ягодичные",
      "Бицепсы бедер"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M25,35 L45,20 M15,40 L35,25\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"68\" cy=\"62\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M66,66 L52,70 L40,58 L32,32\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M65,72 L78,82\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/></svg>",
    "instructions": {
      "initial": "Сядьте в тренажёр, плотно прижмите поясницу и лопатки к спинке. Поставьте стопы на платформу на ширине плеч.",
      "eccentric": "Снимите упоры безопасности. На вдохе плавно опускайте платформу вниз, сгибая колени под углом около 90 градусов.",
      "concentric": "На выдохе выжмите платформу пятками и серединой стопы вверх, не разгибая колени до глухой блокировки (оставляйте мягкий изгиб).",
      "breathing": "Вдох при приближении платформы, выдох при жиме от себя.",
      "mistakes": "Полное «вщелкивание» коленей в суставную блокировку, отрыв поясницы и крестца от сиденья."
    }
  },
  {
    "id": "ex_lunges",
    "name": "Выпады с гантелями",
    "nameEn": "Dumbbell Lunges",
    "category": "legs",
    "categoryName": "Ноги",
    "targetMuscles": [
      "Ягодичные",
      "Квадрицепсы",
      "Бицепс бедра",
      "Стабилизаторы"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><circle cx=\"48\" cy=\"25\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M48,30 L48,50 L64,68 L64,85 M48,50 L32,68 L24,85\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M48,36 L52,50 L52,58\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"52\" cy=\"60\" r=\"4\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>",
    "instructions": {
      "initial": "Встаньте прямо, удерживая гантели в опущенных руках по бокам корпуса. Сделайте широкий шаг вперед одной ногой.",
      "eccentric": "На вдохе опуститесь вниз, сгибая оба колена до угла 90 градусов. Заднее колено почти касается пола.",
      "concentric": "На выдохе оттолкнитесь пяткой передней ноги и вернитесь в исходное положение или сделайте следующий шаг вперед.",
      "breathing": "Вдох при шаге и опускании, выдох при выталкивании наверх.",
      "mistakes": "Удар задним коленом о пол, наклон корпуса вперед с отрывом пятки опорной ноги."
    }
  },
  {
    "id": "ex_romanian_deadlift",
    "name": "Румынская тяга со штангой",
    "nameEn": "Romanian Deadlift",
    "category": "legs",
    "categoryName": "Ноги",
    "targetMuscles": [
      "Бицепсы бедер",
      "Ягодичные мышцы",
      "Разгибатели спины"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><circle cx=\"36\" cy=\"35\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M38,40 L52,48 L56,66 L56,86\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><line x1=\"38\" y1=\"68\" x2=\"68\" y2=\"68\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"38\" cy=\"68\" r=\"6\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"68\" cy=\"68\" r=\"6\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>",
    "instructions": {
      "initial": "Встаньте прямо, штанга в руках на уровне бедер хватом на ширине плеч. Ноги на ширине таза, колени слегка согнуты («мягкие»).",
      "eccentric": "На вдохе отводите таз далеко назад, скользя грифом вдоль передней поверхности бедер вниз до уровня чуть ниже колен. Спина абсолютно прямая.",
      "concentric": "На выдохе сокращением ягодиц и бицепсов бедра подайте таз вперед и вернитесь в вертикальное положение.",
      "breathing": "Вдох при наклоне с отводом таза, выдох при возврате в вертикаль.",
      "mistakes": "Сгибание коленей как в приседе, скругление поясничного отдела, увод штанги далеко от ног."
    }
  },
  {
    "id": "ex_leg_curls",
    "name": "Сгибание ног лёжа в тренажёре",
    "nameEn": "Lying Leg Curls",
    "category": "legs",
    "categoryName": "Ноги",
    "targetMuscles": [
      "Двуглавая мышца бедра (бицепс бедра)",
      "Икроножные"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"15\" y1=\"65\" x2=\"65\" y2=\"65\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"22\" cy=\"58\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M26,62 L55,62 L72,45\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"74\" cy=\"43\" r=\"6\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>",
    "instructions": {
      "initial": "Лягте на живот в тренажёр. Валик расположен чуть ниже икроножных мышц (над ахилловым сухожилием). Возьмитесь за рукояти.",
      "eccentric": "На вдохе подконтрольно опустите валик вниз, полностью растягивая заднюю поверхность бедра.",
      "concentric": "На выдохе согните ноги в коленях, подтягивая валик максимально близко к ягодицам с секундной паузой на пике.",
      "breathing": "Вдох при разгибании ног, выдох при сгибании.",
      "mistakes": "Отрыв таза от скамьи при подъёме веса, резкое бесконтрольное падение валика вниз."
    }
  },
  {
    "id": "ex_calf_raises",
    "name": "Подъёмы на носки стоя",
    "nameEn": "Standing Calf Raises",
    "category": "legs",
    "categoryName": "Ноги",
    "targetMuscles": [
      "Икроножная мышца",
      "Камбаловидная мышца"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"20\" y1=\"85\" x2=\"60\" y2=\"85\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\"/><circle cx=\"50\" cy=\"22\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,27 L50,55 L50,75 L56,82\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Встаньте носками на край платформы или бруска, пятки свободно свисают. Колени прямые, но не заблокированные.",
      "eccentric": "На вдохе медленно опустите пятки как можно ниже, почувствовав глубокое растяжение в икроножных мышцах.",
      "concentric": "На выдохе максимально поднимитесь на носки вверх, задержитесь на секунду в пиковой точке.",
      "breathing": "Вдох при опускании пятки вниз, выдох при подъёме на носок.",
      "mistakes": "Пружинящие быстрые рывки без фиксации, недостаточная амплитуда растяжения внизу."
    }
  },
  {
    "id": "ex_overhead_press",
    "name": "Армейский жим стоя",
    "nameEn": "Overhead Press",
    "category": "shoulders",
    "categoryName": "Плечи",
    "targetMuscles": [
      "Передняя дельта",
      "Средняя дельта",
      "Трицепс",
      "Верх груди"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><circle cx=\"50\" cy=\"35\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,40 L50,65 L45,86 M50,65 L55,86\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><line x1=\"22\" y1=\"18\" x2=\"78\" y2=\"18\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"22\" cy=\"18\" r=\"7\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"78\" cy=\"18\" r=\"7\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M50,44 L38,30 L34,20 M50,44 L62,30 L66,20\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Встаньте прямо, стопы на ширине плеч. Штанга лежит на передних дельтах и ключицах. Хват чуть шире плеч, ягодицы и пресс плотно зажаты.",
      "eccentric": "На вдохе опустите гриф обратно на ключицы подконтрольным движением, слегка убирая голову назад.",
      "concentric": "На выдохе выжмите штангу вертикально над головой, одновременно немного подавая корпус вперед, когда штанга пройдет лицо.",
      "breathing": "Вдох в нижней точке перед жимом, выдох при фиксации штанги над головой.",
      "mistakes": "Чрезмерный прогиб в пояснице, помощь ногами (превращение в толчковый жим швунг)."
    }
  },
  {
    "id": "ex_seated_db_press",
    "name": "Жим гантелей сидя",
    "nameEn": "Seated Dumbbell Shoulder Press",
    "category": "shoulders",
    "categoryName": "Плечи",
    "targetMuscles": [
      "Передняя дельта",
      "Средняя дельта",
      "Трицепсы"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M35,45 L35,80 L65,80\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"50\" cy=\"38\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,43 L50,75 L62,75\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M48,46 L36,36 L34,22 M52,46 L64,36 L66,22\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"34\" cy=\"20\" r=\"4\" fill=\"var(--accent-glow)\"/><circle cx=\"66\" cy=\"20\" r=\"4\" fill=\"var(--accent-glow)\"/></svg>",
    "instructions": {
      "initial": "Сядьте на скамью с вертикальной или почти вертикальной спинкой (80-85 градусов). Поднимите гантели на уровень ушей, ладони направлены вперед.",
      "eccentric": "На вдохе опускайте гантели до уровня мочек ушей или чуть ниже, сохраняя локти под весом.",
      "concentric": "На выдохе выжмите гантели вверх по сходящейся дуге, не ударяя их друг о друга вверху.",
      "breathing": "Вдох при опускании гантелей, выдох при подъёме.",
      "mistakes": "Отрыв спины от спинки скамьи, слишком низкое опускание с болью в плечевом суставе."
    }
  },
  {
    "id": "ex_lateral_raises",
    "name": "Махи гантелями через стороны",
    "nameEn": "Lateral Raises",
    "category": "shoulders",
    "categoryName": "Плечи",
    "targetMuscles": [
      "Средняя дельтовидная (ширина плеч)"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><circle cx=\"50\" cy=\"28\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,33 L50,65 L44,88 M50,65 L56,88\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M50,38 L32,38 L16,42 M50,38 L68,38 L84,42\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"14\" cy=\"43\" r=\"4\" fill=\"var(--accent-glow)\"/><circle cx=\"86\" cy=\"43\" r=\"4\" fill=\"var(--accent-glow)\"/></svg>",
    "instructions": {
      "initial": "Встаньте прямо, гантели держите перед бедрами или по бокам. Локти чуть согнуты и зафиксированы на протяжении всего подхода.",
      "eccentric": "На вдохе медленно опустите руки обратно к бедрам, не бросая снаряды под силой тяжести.",
      "concentric": "На выдохе поднимите руки через стороны до уровня параллели с полом (до высоты плеч), ведя движение локтями вверх.",
      "breathing": "Вдох при опускании гантелей, выдох при подъёме в стороны.",
      "mistakes": "Задирание кистей выше локтей (акцент уходит на трапецию), читинг корпусом при старте."
    }
  },
  {
    "id": "ex_upright_row",
    "name": "Тяга штанги к подбородку",
    "nameEn": "Upright Row",
    "category": "shoulders",
    "categoryName": "Плечи",
    "targetMuscles": [
      "Средняя дельта",
      "Трапеции",
      "Передняя дельта"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><circle cx=\"50\" cy=\"25\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,30 L50,62 L44,85 M50,62 L56,85\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><line x1=\"35\" y1=\"45\" x2=\"65\" y2=\"45\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M50,34 L38,32 L40,44 M50,34 L62,32 L60,44\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Встаньте прямо, штанга удерживается хватом на ширине плеч перед бедрами. Спина прямая.",
      "eccentric": "На вдохе плавно опустите гриф вдоль тела обратно к бёдрам.",
      "concentric": "На выдохе тяните штангу вверх вдоль корпуса, выводя локти выше кистей до уровня груди/ключиц.",
      "breathing": "Вдох при опускании, выдох при подъёме локтей вверх.",
      "mistakes": "Слишком узкий хват (вызывает защемление плечевых сухожилий), задирание штанги выше уровня подбородка."
    }
  },
  {
    "id": "ex_rear_delt_flyes",
    "name": "Разведение гантелей в наклоне",
    "nameEn": "Rear Delt Flyes",
    "category": "shoulders",
    "categoryName": "Плечи",
    "targetMuscles": [
      "Задняя дельтовидная",
      "Подостная",
      "Ромбовидные"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><circle cx=\"35\" cy=\"35\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M38,39 L52,48 L56,66 L56,85\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M48,44 L32,32 L20,30 M48,44 L64,32 L76,30\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"18\" cy=\"30\" r=\"4\" fill=\"var(--accent-glow)\"/><circle cx=\"78\" cy=\"30\" r=\"4\" fill=\"var(--accent-glow)\"/></svg>",
    "instructions": {
      "initial": "Наклоните корпус вперед почти до параллели полу, колени мягкие, спина ровная. Гантели в опущенных руках с легким изгибом в локтях.",
      "eccentric": "На вдохе медленно опустите гантели вниз под действием гравитации.",
      "concentric": "На выдохе разведите руки в стороны назад, стараясь работать задними пучками дельт без сведения лопаток.",
      "breathing": "Вдох при сведении рук внизу, выдох при разведении.",
      "mistakes": "Подъём корпуса во время повторения, чрезмерное включение мышц спины вместо задней дельты."
    }
  },
  {
    "id": "ex_barbell_curl",
    "name": "Подъём штанги на бицепс",
    "nameEn": "Barbell Bicep Curl",
    "category": "arms",
    "categoryName": "Руки",
    "targetMuscles": [
      "Двуглавая мышца плеча (бицепс)",
      "Плечелучевая",
      "Брахиалис"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><circle cx=\"50\" cy=\"25\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,30 L50,62 L45,86 M50,62 L55,86\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M50,35 L48,50 L58,40\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/><line x1=\"46\" y1=\"38\" x2=\"70\" y2=\"38\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"46\" cy=\"38\" r=\"5\" fill=\"var(--accent-glow)\"/><circle cx=\"70\" cy=\"38\" r=\"5\" fill=\"var(--accent-glow)\"/></svg>",
    "instructions": {
      "initial": "Встаньте прямо, штанга в руках хватом снизу на ширине плеч. Локти прижаты к бокам, плечи опущены.",
      "eccentric": "На вдохе подконтрольно опустите штангу вниз, полностью разгибая руку, но не расслабляя мышцы.",
      "concentric": "На выдохе согните руки в локтях, поднимая гриф к груди. Локти остаются неподвижными.",
      "breathing": "Вдох при опускании штанги, выдох на сгибании.",
      "mistakes": "Раскачивание корпусом (читинг поясницей), увод локтей вперед или назад от корпуса."
    }
  },
  {
    "id": "ex_hammer_curls",
    "name": "Молотковые сгибания с гантелями",
    "nameEn": "Hammer Curls",
    "category": "arms",
    "categoryName": "Руки",
    "targetMuscles": [
      "Брахиалис",
      "Плечелучевая мышца",
      "Бицепс"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><circle cx=\"50\" cy=\"25\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,30 L50,62 L45,86 M50,62 L55,86\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M50,35 L44,48 L46,38 M50,35 L56,48 L54,38\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/><rect x=\"43\" y=\"34\" width=\"6\" height=\"8\" rx=\"2\" fill=\"var(--accent-glow)\"/><rect x=\"51\" y=\"34\" width=\"6\" height=\"8\" rx=\"2\" fill=\"var(--accent-glow)\"/></svg>",
    "instructions": {
      "initial": "Стоя прямо, держите гантели нейтральным хватом (ладони обращены друг к другу). Плечи расправлены.",
      "eccentric": "На вдохе медленно опустите гантели вниз до полного выпрямления локтевого сустава.",
      "concentric": "На выдохе согните предплечья вверх, сохраняя нейтральный хват на всей траектории.",
      "breathing": "Вдох при опускании, выдох при подъёме гантелей.",
      "mistakes": "Вращение кисти во время движения, вынос локтей далеко вперед."
    }
  },
  {
    "id": "ex_preacher_curls",
    "name": "Сгибания на скамье Скотта",
    "nameEn": "Preacher Curls",
    "category": "arms",
    "categoryName": "Руки",
    "targetMuscles": [
      "Нижняя часть бицепса (пиковое сокращение)",
      "Брахиалис"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M35,60 L55,45 L55,85\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"42\" cy=\"35\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M44,40 L50,50 L48,40\" stroke=\"var(--accent)\" stroke-width=\"4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"47\" cy=\"38\" r=\"4\" fill=\"var(--accent-glow)\"/></svg>",
    "instructions": {
      "initial": "Сядьте за скамью Скотта, плотно уприте подмышки в верхний срез наклонной подушки. Возьмите EZ-гриф хватом снизу.",
      "eccentric": "На вдохе медленно опускайте гриф почти до полного выпрямления рук (не допуская переразгибания сустава).",
      "concentric": "На выдохе согните руки силой бицепса, не отрывая трицепсы от опорной подушки.",
      "breathing": "Вдох при опускании снаряда, выдох при подъёме.",
      "mistakes": "Отрыв тела от сиденья и помощь корпусом, удар суставов в нижней точке."
    }
  },
  {
    "id": "ex_skull_crushers",
    "name": "Французский жим лёжа",
    "nameEn": "Skull Crushers",
    "category": "arms",
    "categoryName": "Руки",
    "targetMuscles": [
      "Длинная и латеральная головка трицепса"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M20,70 L80,70 M30,70 L30,85 M70,70 L70,85\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"28\" cy=\"62\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M32,65 L60,65\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M42,62 L42,42 L26,45\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"24\" cy=\"45\" r=\"5\" fill=\"var(--accent-glow)\"/></svg>",
    "instructions": {
      "initial": "Лягте на скамью, удерживая EZ-гриф на вытянутых руках под небольшим наклоном назад от вертикали (к макушке головы).",
      "eccentric": "На вдохе сгибайте только предплечья, опуская гриф за голову или к темени. Локти сохраняют постоянную ширину.",
      "concentric": "На выдохе выпрямите руки в локтях за счёт трицепсов, вернув вес в исходное положение.",
      "breathing": "Вдох при опускании штанги ко лбу/за голову, выдох при разгибании рук.",
      "mistakes": "Разведение локтей в стороны во время жима, движение плечевой кости вперед-назад."
    }
  },
  {
    "id": "ex_tricep_pushdown",
    "name": "Разгибание рук на блоке книзу",
    "nameEn": "Tricep Pushdown",
    "category": "arms",
    "categoryName": "Руки",
    "targetMuscles": [
      "Латеральная и медиальная головка трицепса"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><path d=\"M65,15 L65,35\" stroke=\"currentColor\" stroke-width=\"2\" stroke-dasharray=\"2,2\"/><circle cx=\"45\" cy=\"30\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M45,35 L45,65 L40,86 M45,65 L50,86\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M46,38 L54,48 L56,62\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Встаньте перед верхним блоком, возьмите рукоять или канат. Локти зафиксируйте плотно по бокам корпуса, корпус чуть наклонен вперед.",
      "eccentric": "На вдохе дайте рукояти подняться до уровня груди (локти согнуты на 90 градусов), удерживая плечи неподвижными.",
      "concentric": "На выдохе мощно разогните руки вниз до полного выпрямления в локтях с фиксацией на 1 секунду.",
      "breathing": "Вдох при сгибании локтей вверх, выдох при разгибании книзу.",
      "mistakes": "Помощь весом всего тела («наваливание» на рукоять), гуляющие вперед-назад локти."
    }
  },
  {
    "id": "ex_bench_dips",
    "name": "Обратные отжимания от скамьи",
    "nameEn": "Bench Dips",
    "category": "arms",
    "categoryName": "Руки",
    "targetMuscles": [
      "Трицепс",
      "Передняя дельта"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"25\" y1=\"65\" x2=\"50\" y2=\"65\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"52\" cy=\"42\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,47 L50,68 L70,72 L82,82\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M48,50 L42,56 L42,65\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Упритесь ладонями в край скамьи сзади, пальцы направлены вперед. Ноги вытянуты вперед или согнуты в коленях.",
      "eccentric": "На вдохе опускайте таз вниз вдоль скамьи за счёт сгибания рук в локтях до прямого угла.",
      "concentric": "На выдохе разогните руки и вернитесь в исходное положение за счёт работы трицепсов.",
      "breathing": "Вдох при опускании вниз, выдох при подъёме.",
      "mistakes": "Удаление корпуса далеко вперед от скамьи (создает опасный вращательный момент в плечах)."
    }
  },
  {
    "id": "ex_plank",
    "name": "Планка классическая",
    "nameEn": "Plank",
    "category": "core",
    "categoryName": "Кор",
    "targetMuscles": [
      "Прямая мышца живота",
      "Поперечная мышца",
      "Мышцы спины",
      "Ягодичные"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"15\" y1=\"80\" x2=\"85\" y2=\"80\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"24\" cy=\"56\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M26,60 L54,64 L80,78\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M32,62 L32,74 L40,78\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Примите упор на предплечья и носки. Локти строго под плечевыми суставами. Тело натянуто как струна.",
      "eccentric": "Статическое удержание: мышцы живота и ягодицы максимально напряжены, таз подкручен.",
      "concentric": "Сохраняйте ровное положение без прогиба в пояснице заданное количество секунд.",
      "breathing": "Не задерживайте дыхание: спокойные, размеренные вдохи и выдохи через нос и рот.",
      "mistakes": "Провисание таза в пояснице, задирание ягодиц вверх «горкой», запрокидывание головы."
    }
  },
  {
    "id": "ex_crunches",
    "name": "Скручивания на полу",
    "nameEn": "Crunches",
    "category": "core",
    "categoryName": "Кор",
    "targetMuscles": [
      "Прямая мышца живота (верхняя часть)"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"15\" y1=\"80\" x2=\"85\" y2=\"80\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"26\" cy=\"60\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M30,64 C42,66 52,70 60,78 L72,60 L80,80\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M28,62 L22,54\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg>",
    "instructions": {
      "initial": "Лягте на спину, согните ноги в коленях, стопы на полу. Руки у висков или скрещены на груди. Поясница прижата к полу.",
      "eccentric": "На вдохе медленно опустите лопатки обратно на коврик, сохраняя напряжение в прессе.",
      "concentric": "На выдохе скрутите верхнюю часть туловища к тазу, отрывая от пола только лопатки и сжимая пресс.",
      "breathing": "Вдох при опускании, акцентированный выдох при скручивании.",
      "mistakes": "Тяга шеи руками вперед с риском травмы шейного отдела, отрыв поясницы от пола."
    }
  },
  {
    "id": "ex_hanging_leg_raises",
    "name": "Подъёмы ног в висе",
    "nameEn": "Hanging Leg Raises",
    "category": "core",
    "categoryName": "Кор",
    "targetMuscles": [
      "Нижняя часть пресса",
      "Подвздошно-поясничная",
      "Косые мышцы"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"25\" y1=\"15\" x2=\"75\" y2=\"15\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"50\" cy=\"35\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,40 L50,62 L32,62\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M50,42 L42,28 L46,16 M50,42 L58,28 L54,16\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Повисните на турнике прямым хватом, тело выпрямлено, без раскачки.",
      "eccentric": "На вдохе медленно и подконтрольно опустите ноги вниз, не давая телу раскачиваться.",
      "concentric": "На выдохе поднимите прямые или чуть согнутые ноги вперед до параллели полу или выше (подкручивая таз к ребрам).",
      "breathing": "Вдох при опускании ног, выдох при подъёме.",
      "mistakes": "Раскачивание корпусом по инерции, подъём ног за счёт сгибателей бедра без подкручивания таза."
    }
  },
  {
    "id": "ex_russian_twists",
    "name": "Русские скручивания",
    "nameEn": "Russian Twists",
    "category": "core",
    "categoryName": "Кор",
    "targetMuscles": [
      "Косые мышцы живота",
      "Прямая мышца",
      "Глубокие стабилизаторы"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><line x1=\"15\" y1=\"85\" x2=\"85\" y2=\"85\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"42\" cy=\"42\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M44,47 L56,70 L72,62 L82,82\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"66\" cy=\"52\" r=\"5\" fill=\"var(--accent-glow)\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>",
    "instructions": {
      "initial": "Сядьте на пол, отклоните корпус назад под 45 градусов, оторвите стопы от пола и согните колени (поза V). Возьмите вес или сложите ладони вместе.",
      "eccentric": "На вдохе вернитесь в центр перед следующим поворотом.",
      "concentric": "На выдохе поверните корпус вправо, касаясь руками пола возле бедра. На следующем выдохе повернитесь влево.",
      "breathing": "Короткий выдох на каждом повороте корпуса, вдох при переходе через центр.",
      "mistakes": "Движение только руками без поворота грудной клетки, скругление поясницы."
    }
  },
  {
    "id": "ex_stomach_vacuum",
    "name": "Вакуум живота",
    "nameEn": "Stomach Vacuum",
    "category": "core",
    "categoryName": "Кор",
    "targetMuscles": [
      "Поперечная мышца живота (плоский живот)",
      "Диафрагма"
    ],
    "svgIcon": "<svg viewBox=\"0 0 100 100\" class=\"ex-svg\"><circle cx=\"50\" cy=\"25\" r=\"5\" fill=\"var(--accent)\"/><path d=\"M50,30 L50,42 Q42,50 50,58 L50,65 L44,86 M50,65 L56,86\" stroke=\"var(--accent)\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M44,48 Q49,50 44,54\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\"/></svg>",
    "instructions": {
      "initial": "Встаньте прямо или наклонитесь с опорой руками на колени. Сделайте глубокий вдох, а затем полный глубокий выдох, освободив лёгкие от воздуха.",
      "eccentric": "После задержки плавно расслабьте живот и сделайте спокойный мягкий вдох.",
      "concentric": "На задержке дыхания после выдоха втяните живот максимально внутрь под рёбра к позвоночнику. Удерживайте вакуум 15-30 секунд.",
      "breathing": "Полный выдох перед втягиванием живота, фиксация на задержке дыхания.",
      "mistakes": "Попытка дышать во время вакуума, выполнение упражнения на полный желудок."
    }
  }
];
