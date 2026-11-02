// BentoFit Technique Figures
// Every built-in exercise is a pair of poses (start / finish) solved with two-bone IK,
// so limbs keep their length and the same data draws thumbnails and the looping animation.
(function () {
  const LEN = { torso: 46, upperArm: 26, foreArm: 25, thigh: 34, shin: 33, foot: 13 };
  const FLOOR = 150;
  const R = (n) => Math.round(n * 10) / 10;

  // ---------- geometry helpers ----------
  const add = (a, b, k) => [a[0] + b[0] * (k === undefined ? 1 : k), a[1] + b[1] * (k === undefined ? 1 : k)];
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const unit = (deg) => [Math.cos(deg * Math.PI / 180), -Math.sin(deg * Math.PI / 180)];

  function ik(root, target, l1, l2, sign) {
    const dx = target[0] - root[0];
    const dy = target[1] - root[1];
    const raw = Math.hypot(dx, dy) || 0.001;
    const d = Math.min(Math.max(raw, Math.abs(l1 - l2) + 0.5), l1 + l2 - 0.2);
    const ux = dx / raw;
    const uy = dy / raw;
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const joint = [root[0] + ux * a + uy * h * sign, root[1] + uy * a - ux * h * sign];
    return { joint: joint, end: [root[0] + ux * d, root[1] + uy * d] };
  }

  function capsule(a, ra, b, rb) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 0.001;
    const px = -dy / len;
    const py = dx / len;
    return `M${R(a[0] + px * ra)} ${R(a[1] + py * ra)}L${R(b[0] + px * rb)} ${R(b[1] + py * rb)}`
      + `A${rb} ${rb} 0 0 0 ${R(b[0] - px * rb)} ${R(b[1] - py * rb)}`
      + `L${R(a[0] - px * ra)} ${R(a[1] - py * ra)}A${ra} ${ra} 0 0 0 ${R(a[0] + px * ra)} ${R(a[1] + py * ra)}Z`;
  }
  const circle = (c, r) => `M${R(c[0] - r)} ${R(c[1])}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
  const line = (a, b) => `M${R(a[0])} ${R(a[1])}L${R(b[0])} ${R(b[1])}`;

  // ---------- pose normalisation & solving ----------
  function normalise(def, pose) {
    const front = !!def.front;
    const t = unit(pose.t === undefined ? 90 : pose.t);
    const n = [-t[1], t[0]];
    const tl = pose.tl || def.tl || LEN.torso;
    const shoulder = add(pose.h, t, tl);
    const rel = (r) => add(add(shoulder, t, r[0]), n, r[1]);
    const H = pose.Hr ? rel(pose.Hr) : pose.H;
    const cx = pose.h[0];
    const H2 = pose.H2 || (front ? [2 * cx - H[0], H[1]] : add(H, [3, -1]));
    const A = pose.A || [cx, 143];
    const A2 = pose.A2 || (front ? [2 * cx - A[0], A[1]] : add(A, [4, 0]));
    const e = pose.e === undefined ? (front ? 1 : -1) : pose.e;
    const k = pose.k === undefined ? 1 : pose.k;
    return {
      h: pose.h, t: pose.t === undefined ? 90 : pose.t, tl: tl, H: H, H2: H2, A: A, A2: A2,
      f: pose.f === undefined ? (front ? 180 : 0) : pose.f,
      f2: pose.f2 === undefined ? (pose.f === undefined ? 0 : pose.f) : pose.f2,
      e: e, e2: pose.e2 === undefined ? (front ? -e : e) : pose.e2,
      k: k, k2: pose.k2 === undefined ? (front ? -k : k) : pose.k2,
    };
  }

  function lerpPose(a, b, k) {
    return {
      h: mix(a.h, b.h, k), t: a.t + (b.t - a.t) * k, tl: a.tl + (b.tl - a.tl) * k,
      H: mix(a.H, b.H, k), H2: mix(a.H2, b.H2, k), A: mix(a.A, b.A, k), A2: mix(a.A2, b.A2, k),
      f: a.f + (b.f - a.f) * k, f2: a.f2 + (b.f2 - a.f2) * k,
      e: k < 0.5 ? a.e : b.e, e2: k < 0.5 ? a.e2 : b.e2, k: k < 0.5 ? a.k : b.k, k2: k < 0.5 ? a.k2 : b.k2,
    };
  }

  function solve(def, p) {
    const front = !!def.front;
    const t = unit(p.t);
    const n = [-t[1], t[0]];
    const shoulder = add(p.h, t, p.tl);
    const sN = front ? add(shoulder, [-12, 2]) : shoulder;
    const sF = front ? add(shoulder, [12, 2]) : add(shoulder, [2, -1]);
    const hN = front ? add(p.h, [-7, 0]) : p.h;
    const hF = front ? add(p.h, [7, 0]) : add(p.h, [2, 0]);
    const armN = ik(sN, p.H, LEN.upperArm, LEN.foreArm, p.e);
    const armF = ik(sF, p.H2, LEN.upperArm, LEN.foreArm, p.e2);
    const legN = ik(hN, p.A, LEN.thigh, LEN.shin, p.k);
    const legF = ik(hF, p.A2, LEN.thigh, LEN.shin, p.k2);
    return {
      t: t, n: n, hip: p.h, shoulder: shoulder, head: add(shoulder, t, 15),
      sN: sN, sF: sF, hN: hN, hF: hF,
      eN: armN.joint, hdN: armN.end, eF: armF.joint, hdF: armF.end,
      kN: legN.joint, aN: legN.end, kF: legF.joint, aF: legF.end,
      tN: add(legN.end, unit(p.f), LEN.foot), tF: add(legF.end, unit(p.f2), LEN.foot),
    };
  }

  // ---------- muscles ----------
  function limbMuscle(from, to, side, offset, r1, r2, s, e) {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = (dy / len) * side * offset;
    const ny = (-dx / len) * side * offset;
    return capsule([from[0] + dx * s + nx, from[1] + dy * s + ny], r1, [from[0] + dx * e + nx, from[1] + dy * e + ny], r2);
  }

  function torsoMuscle(J, a, b, off, r1, r2) {
    return capsule(add(add(J.hip, J.t, a), J.n, off), r1, add(add(J.hip, J.t, b), J.n, off), r2);
  }

  function muscleParts(def, J, group) {
    const out = [];
    const list = def.m || [];
    const front = !!def.front;
    const has = (name) => list.indexOf(name) >= 0;
    if (group === 'torso') {
      const tl = Math.hypot(J.shoulder[0] - J.hip[0], J.shoulder[1] - J.hip[1]);
      if (front) {
        if (has('chest')) {
          out.push(capsule(add(J.shoulder, [-7, 7]), 6, add(J.shoulder, [7, 7]), 6));
        }
        if (has('abs')) out.push(capsule(add(J.shoulder, [0, tl * 0.42]), 5.5, add(J.hip, [0, -5]), 5));
        if (has('back')) out.push(capsule(add(J.shoulder, [-10, 10]), 4, add(J.hip, [-7, -12]), 3));
        if (has('back')) out.push(capsule(add(J.shoulder, [10, 10]), 4, add(J.hip, [7, -12]), 3));
      } else {
        if (has('chest')) out.push(torsoMuscle(J, tl * 0.66, tl * 0.9, 4.5, 5.5, 5));
        if (has('abs')) out.push(torsoMuscle(J, tl * 0.16, tl * 0.56, 4.6, 4, 4.6));
        if (has('back')) out.push(torsoMuscle(J, tl * 0.48, tl * 0.92, -4.5, 4, 6));
        if (has('lowback')) out.push(torsoMuscle(J, tl * 0.08, tl * 0.42, -4.8, 4.2, 3.6));
      }
      if (has('glute')) {
        out.push(front ? capsule(add(J.hip, [-7, 2]), 7, add(J.hip, [7, 2]), 7) : circle(add(J.hip, J.n, -5), 9.5));
      }
    }
    if (group === 'leg') {
      const legs = front ? [[J.hN, J.kN, J.aN], [J.hF, J.kF, J.aF]] : [[J.hN, J.kN, J.aN]];
      legs.forEach((leg) => {
        if (has('quad')) out.push(limbMuscle(leg[0], leg[1], 1, 2.2, 5.2, 3.8, 0.14, 0.86));
        if (has('ham')) out.push(limbMuscle(leg[0], leg[1], -1, 2.2, 5, 3.6, 0.18, 0.86));
        if (has('calf')) out.push(limbMuscle(leg[1], leg[2], -1, 1.6, 4.2, 2.6, 0.1, 0.6));
      });
    }
    if (group === 'arm') {
      const arms = front ? [[J.sN, J.eN, J.hdN], [J.sF, J.eF, J.hdF]] : [[J.sN, J.eN, J.hdN]];
      arms.forEach((arm) => {
        if (has('delt')) out.push(circle(arm[0], 6.6));
        if (has('bi')) out.push(limbMuscle(arm[0], arm[1], 1, 1.4, 3.6, 2.8, 0.2, 0.86));
        if (has('tri')) out.push(limbMuscle(arm[0], arm[1], -1, 1.4, 3.6, 2.8, 0.2, 0.86));
        if (has('fore')) out.push(limbMuscle(arm[1], arm[2], 1, 0.6, 3.2, 2, 0.08, 0.6));
      });
    }
    return out;
  }

  // ---------- body assembly (order stays fixed so animation can reuse elements) ----------
  function heldParts(def, J, p, which) {
    const parts = [];
    const hold = def.hold;
    if (!hold) return parts;
    const hands = which === 'far' ? [J.hdF] : [J.hdN];
    hands.forEach((hand) => {
      if (hold === 'bar' && which !== 'far') {
        const r = def.pr || 14;
        parts.push(['fig-plate', circle(hand, r)]);
        parts.push(['fig-hub', circle(hand, 3)]);
      } else if (hold === 'db') {
        parts.push(['fig-iron', line([hand[0] - 9, hand[1]], [hand[0] + 9, hand[1]])]);
        parts.push(['fig-plate', circle([hand[0] - 9, hand[1]], 4.6)]);
        parts.push(['fig-plate', circle([hand[0] + 9, hand[1]], 4.6)]);
      } else if (hold === 'kb') {
        parts.push(['fig-plate', circle([hand[0], hand[1] + 9], 8)]);
      } else if (hold === 'handle') {
        parts.push(['fig-iron', line([hand[0] - 6, hand[1] + 1], [hand[0] + 6, hand[1] - 1])]);
      }
    });
    return parts;
  }

  function tetherParts(def, J) {
    const parts = [];
    const cls = def.band ? 'fig-band' : 'fig-cable';
    const anchorDef = def.band || def.cable;
    if (!anchorDef) return parts;
    const footAnchor = [J.aN[0] + 4, FLOOR - 1];
    const toPoint = def.bandTo === 'hip' ? J.hip : def.bandTo === 'ankle' ? J.aN : J.hdN;
    if (anchorDef === 'foot') {
      parts.push([cls, line(footAnchor, toPoint)]);
      if (def.front) parts.push([cls, line([J.aF[0] - 4, FLOOR - 1], J.hdF)]);
    } else if (anchorDef === 'span') {
      parts.push([cls, line(J.hdN, J.hdF)]);
    } else if (Array.isArray(anchorDef[0])) {
      parts.push([cls, line(anchorDef[0], J.hdN)]);
      parts.push([cls, line(anchorDef[1], J.hdF)]);
    } else {
      parts.push([cls, line(anchorDef, toPoint)]);
    }
    return parts;
  }

  function bodyParts(def, pose) {
    const J = solve(def, pose);
    const front = !!def.front;
    const farCls = front ? 'fig-body' : 'fig-far';
    const parts = [];
    const noLegs = !!def.noLegs;

    parts.push.apply(parts, tetherParts(def, J));
    if (!front && def.hold === 'db') parts.push.apply(parts, heldParts(def, J, pose, 'far'));
    if (!front) {
      parts.push([farCls, capsule(J.sF, 4.6, J.eF, 3.8)]);
      parts.push([farCls, capsule(J.eF, 3.8, J.hdF, 2.8)]);
    }
    if (!noLegs) {
      parts.push([farCls, capsule(J.hF, 6.6, J.kF, 4.6)]);
      parts.push([farCls, capsule(J.kF, 4.6, J.aF, 3)]);
      parts.push([farCls, capsule(J.aF, 3, J.tF, 2.2)]);
    }

    if (front) {
      parts.push(['fig-body', capsule(mix(J.sN, J.sF, 0.5), 13, J.hip, 10)]);
      parts.push(['fig-body', capsule(J.sN, 5, J.sF, 5)]);
    } else {
      parts.push(['fig-body', capsule(add(J.shoulder, J.t, -3), 9.5, J.hip, 8.4)]);
    }
    parts.push(['fig-head', circle(J.head, 8.6)]);
    muscleParts(def, J, 'torso').forEach((d) => parts.push(['fig-muscle', d]));

    if (!noLegs) {
      parts.push(['fig-body', capsule(J.hN, 7, J.kN, 4.8)]);
      parts.push(['fig-body', capsule(J.kN, 4.8, J.aN, 3.2)]);
      parts.push(['fig-body', capsule(J.aN, 3.2, J.tN, 2.4)]);
      muscleParts(def, J, 'leg').forEach((d) => parts.push(['fig-muscle', d]));
    }

    if (def.hold === 'sled') {
      const dir = unit(pose.f);
      parts.push(['fig-iron', line(add(J.aN, dir, -6), add(J.aN, dir, 20))]);
    }
    if (def.hold === 'roller') parts.push(['fig-plate', circle(J.aN, 5.5)]);

    if (front && def.hold) parts.push.apply(parts, heldParts(def, J, pose, 'far'));
    parts.push.apply(parts, heldParts(def, J, pose, 'near'));

    if (front) {
      parts.push(['fig-body', capsule(J.sF, 4.8, J.eF, 3.8)]);
      parts.push(['fig-body', capsule(J.eF, 3.8, J.hdF, 2.8)]);
    }
    parts.push(['fig-body', capsule(J.sN, 4.8, J.eN, 3.8)]);
    parts.push(['fig-body', capsule(J.eN, 3.8, J.hdN, 2.8)]);
    muscleParts(def, J, 'arm').forEach((d) => parts.push(['fig-muscle', d]));
    return { parts: parts, J: J };
  }

  // ---------- static gear ----------
  function gearMarkup(item) {
    const type = item[0];
    if (type === 'l') {
      return `<path class="fig-gear" d="M${item[1]} ${item[2]}L${item[3]} ${item[4]}" stroke-width="${item[5] || 4}"/>`;
    }
    if (type === 'r') {
      return `<rect class="fig-gear-fill" x="${item[1]}" y="${item[2]}" width="${item[3]}" height="${item[4]}" rx="${item[5] === undefined ? 2 : item[5]}"/>`;
    }
    if (type === 'c') {
      return `<circle class="fig-gear-fill" cx="${item[1]}" cy="${item[2]}" r="${item[3]}"/>`;
    }
    if (type === 'o') {
      return `<circle class="fig-gear" cx="${item[1]}" cy="${item[2]}" r="${item[3]}" stroke-width="${item[4] || 4}"/>`;
    }
    return '';
  }
  function gearBounds(item, b) {
    const grow = (x, y) => { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); };
    if (item[0] === 'l') { grow(item[1], item[2]); grow(item[3], item[4]); }
    if (item[0] === 'r') { grow(item[1], item[2]); grow(item[1] + item[3], item[2] + item[4]); }
    if (item[0] === 'c' || item[0] === 'o') { grow(item[1] - item[3], item[2] - item[3]); grow(item[1] + item[3], item[2] + item[3]); }
  }
  const G = {
    bench: (x1, x2, y) => [['r', x1, y, x2 - x1, 6, 3], ['l', x1 + 14, y + 6, x1 + 14, FLOOR, 4], ['l', x2 - 14, y + 6, x2 - 14, FLOOR, 4]],
    seat: (x1, x2, y) => [['r', x1, y, x2 - x1, 6, 3], ['l', (x1 + x2) / 2, y + 6, (x1 + x2) / 2, FLOOR, 4]],
    pad: (x1, y1, x2, y2) => [['l', x1, y1, x2, y2, 7]],
    post: (x, y) => [['l', x, y, x, FLOOR, 4]],
    bar: (x, y, post) => [['l', x - 16, y, x + 22, y, 4], ['l', x + 22, y, x + 22, post === false ? y - 12 : FLOOR, 4]],
    door: (x, y1, y2) => [['l', x, y1, x, y2, 5], ['c', x - 3, y2 - 18, 3]],
    box: (x, y, w, h) => [['r', x, y, w, h, 3]],
    pulley: (x, y) => [['o', x, y, 4, 2.5]],
  };
  const join = (...groups) => groups.reduce((acc, g) => acc.concat(g), []);

  // ---------- pose library ----------
  // h hip, t torso angle (90 = up, 0 = head right, 180 = head left), H / H2 hands, Hr hand relative to shoulder
  // [along torso, towards chest], A / A2 ankles, f foot angle, e / k elbow and knee bend side.
  const STAND = { h: [100, 77], t: 90, A: [100, 143] };
  const SIT = { h: [100, 105], t: 92, A: [150, 143] };
  const S = (extra) => Object.assign({}, STAND, extra);
  const C = (extra) => Object.assign({}, SIT, extra);
  const LIE = { h: [118, 90], t: 180, A: [150, 143] };
  const L_ = (extra) => Object.assign({}, LIE, extra);
  const FB = { h: [100, 77], t: 90, A: [90, 143], k: -1 };
  const F = (extra) => Object.assign({}, FB, extra);

  const barPress = { m: ['chest', 'tri', 'delt'], hold: 'bar', gear: G.bench(42, 130, 100) };
  const pullGear = G.bar(100, 20);
  const rowHinge = { h: [82, 85], t: 30, A: [100, 143] };

  const FIGURES = {
    // ---- chest
    ex_bench_press: Object.assign({}, barPress, { a: L_({ H: [74, 70] }), b: L_({ H: [72, 40] }) }),
    ex_incline_db_press: {
      m: ['chest', 'delt', 'tri'], hold: 'db',
      gear: join(G.pad(113, 107, 59, 70), [['l', 92, 92, 92, 150, 4], ['l', 110, 108, 135, 108, 6], ['l', 122, 108, 122, 150, 4]]),
      a: { h: [118, 100], t: 145, A: [155, 143], H: [88, 52] },
      b: { h: [118, 100], t: 145, A: [155, 143], H: [84, 24] },
    },
    ex_dips: {
      m: ['chest', 'tri'], gear: [['l', 82, 75, 128, 75, 5], ['l', 122, 75, 122, 150, 4]],
      a: { h: [88, 70], t: 75, H: [100, 75], A: [62, 125] },
      b: { h: [86, 100], t: 70, H: [100, 75], A: [56, 138] },
    },
    ex_dumbbell_flyes: {
      front: true, noLegs: true, tl: 14, m: ['chest'], hold: 'db', gear: join([['r', 80, 108, 40, 7, 3]], G.post(100, 115)),
      a: { h: [100, 100], t: 90, H: [46, 96], e: 1 }, b: { h: [100, 100], t: 90, H: [93, 42], e: 1 },
    },
    ex_cable_crossover: {
      front: true, m: ['chest'], cable: [[20, 8], [180, 8]], gear: [['o', 20, 8, 4, 2.5], ['o', 180, 8, 4, 2.5], ['l', 20, 12, 20, 150, 3], ['l', 180, 12, 180, 150, 3]],
      a: F({ H: [52, 48], e: 1 }), b: F({ H: [96, 84], e: 1 }),
    },
    ex_pushups: {
      m: ['chest', 'tri'],
      a: { h: [78, 105], t: 14, H: [124, 145], A: [14, 128], f: -70, k: 1 },
      b: { h: [76, 122], t: 5, H: [124, 145], A: [12, 130], f: -70, k: 1 },
    },
    ex_pec_deck: {
      front: true, tl: 44, m: ['chest'], gear: join(G.seat(84, 116, 113), [['r', 88, 56, 24, 52, 3], ['l', 40, 60, 160, 60, 3], ['l', 40, 60, 40, 150, 4], ['l', 160, 60, 160, 150, 4]]),
      a: { h: [100, 104], t: 90, H: [50, 64], A: [86, 143], k: -1, e: 1 },
      b: { h: [100, 104], t: 90, H: [95, 64], A: [86, 143], k: -1, e: 1 },
    },
    ex_handle_pushups: {
      m: ['chest', 'tri'], gear: [['r', 116, 141, 18, 4, 2], ['l', 118, 145, 118, 150, 3], ['l', 132, 145, 132, 150, 3]],
      a: { h: [78, 98], t: 14, H: [125, 139], A: [14, 128], f: -70, k: 1 },
      b: { h: [74, 124], t: 4, H: [125, 139], A: [10, 131], f: -70, k: 1 },
    },
    ex_decline_pushups: {
      m: ['chest', 'delt', 'tri'], gear: G.box(4, 100, 38, 50),
      a: { h: [75, 85], t: -20, H: [122, 147], A: [24, 92], f: -40, k: 1 },
      b: { h: [70, 112], t: -15, H: [122, 147], A: [24, 92], f: -40, k: 1 },
    },
    ex_band_chest_press: {
      m: ['chest', 'tri'], band: [28, 52], gear: G.door(26, 8, 150),
      a: S({ A: [106, 143], H: [116, 46] }), b: S({ A: [106, 143], H: [150, 42] }),
    },
    // ---- back
    ex_deadlift: {
      m: ['ham', 'glute', 'lowback', 'back'], hold: 'bar', pr: 22,
      a: { h: [84, 100], t: 28, H: [116, 128], A: [108, 143] },
      b: { h: [98, 77], t: 90, H: [101, 82], A: [104, 143] },
    },
    ex_pullups: {
      noFloor: true, m: ['back', 'bi'], gear: pullGear,
      a: { h: [96, 116], t: 85, H: [100, 20], A: [72, 165] },
      b: { h: [95, 84], t: 84, H: [100, 20], A: [70, 135] },
    },
    ex_chinups: {
      noFloor: true, m: ['bi', 'back', 'chest'], gear: pullGear,
      a: { h: [96, 116], t: 85, H: [100, 20], A: [72, 165] },
      b: { h: [95, 84], t: 84, H: [100, 20], A: [70, 135] },
    },
    ex_negative_pullups: {
      noFloor: true, m: ['back', 'bi'], gear: pullGear,
      a: { h: [95, 84], t: 84, H: [100, 20], A: [70, 135] },
      b: { h: [96, 116], t: 85, H: [100, 20], A: [72, 165] },
    },
    ex_barbell_row: {
      m: ['back', 'bi', 'lowback'], hold: 'bar', pr: 16,
      a: Object.assign({}, rowHinge, { H: [118, 112] }), b: Object.assign({}, rowHinge, { H: [104, 92] }),
    },
    ex_lat_pulldown: {
      m: ['back', 'bi'], hold: 'handle', cable: [100, -14], gear: join(G.seat(80, 120, 114), [['o', 100, -14, 4, 2.5], ['c', 128, 92, 6]]),
      a: { h: [100, 105], t: 100, H: [100, 6], A: [150, 143] },
      b: { h: [100, 105], t: 104, H: [106, 52], A: [150, 143] },
    },
    ex_seated_cable_row: {
      m: ['back', 'bi'], hold: 'handle', cable: [176, 92], gear: join(G.seat(62, 102, 127), [['l', 158, 118, 158, 150, 5], ['o', 176, 92, 4, 2.5], ['l', 176, 96, 176, 150, 3]]),
      a: { h: [80, 118], t: 74, H: [142, 86], A: [148, 136], f: 70 },
      b: { h: [80, 118], t: 96, H: [106, 92], A: [148, 136], f: 70 },
    },
    ex_hyperextension: {
      m: ['lowback', 'glute', 'ham'], gear: [['l', 100, 96, 122, 106, 7], ['c', 42, 136, 5], ['l', 42, 141, 42, 150, 3], ['l', 112, 104, 112, 150, 4], ['l', 42, 148, 112, 148, 3]],
      a: { h: [105, 85], t: -50, Hr: [-8, 10], A: [46, 124], f: -60 },
      b: { h: [105, 85], t: 33, Hr: [-8, 10], A: [46, 124], f: -60 },
    },
    ex_chest_supported_row: {
      m: ['back', 'delt', 'bi'], hold: 'db', gear: [['l', 96, 100, 140, 68, 7], ['l', 118, 88, 118, 150, 4], ['l', 88, 112, 118, 112, 4]],
      a: { h: [85, 85], t: 40, H: [124, 106], A: [60, 143] }, b: { h: [85, 85], t: 40, H: [103, 88], A: [60, 143] },
    },
    ex_single_arm_db_row: {
      m: ['back', 'bi'], hold: 'db', gear: G.bench(112, 170, 110),
      a: { h: [85, 90], t: 15, H: [122, 128], H2: [134, 108], A: [75, 143], A2: [92, 143] },
      b: { h: [85, 90], t: 15, H: [102, 100], H2: [134, 108], A: [75, 143], A2: [92, 143] },
    },
    ex_inverted_row: {
      m: ['back', 'bi'], gear: [['l', 52, 80, 88, 80, 4], ['l', 56, 80, 56, 150, 4]],
      a: { h: [126, 134], t: 173, H: [70, 80], A: [192, 143], f: 70, k: 1 },
      b: { h: [128, 118], t: 158, H: [70, 80], A: [192, 143], f: 70, k: 1 },
    },
    ex_band_row: {
      m: ['back', 'bi'], band: [184, 56], hold: 'handle', gear: G.door(186, 8, 150),
      a: S({ H: [150, 52] }), b: S({ H: [112, 62] }),
    },
    ex_band_pulldown: {
      m: ['back', 'bi'], band: [158, -28], hold: 'handle', gear: G.door(160, -34, 150),
      a: S({ t: 84, H: [132, -14], A: [96, 143] }), b: S({ t: 84, H: [112, 62], A: [96, 143] }),
    },
    // ---- legs
    ex_squat: {
      m: ['quad', 'glute'], hold: 'bar', pr: 15,
      a: { h: [95, 77], t: 90, Hr: [-2, -8], A: [100, 143] },
      b: { h: [78, 118], t: 55, Hr: [-2, -8], A: [100, 143] },
    },
    ex_air_squat: {
      m: ['quad', 'glute'],
      a: { h: [95, 77], t: 90, H: [140, 44], A: [100, 143] },
      b: { h: [78, 118], t: 55, H: [146, 84], A: [100, 143] },
    },
    ex_goblet_squat: {
      m: ['quad', 'glute'], hold: 'kb',
      a: { h: [95, 77], t: 90, Hr: [-12, 16], A: [100, 143] },
      b: { h: [78, 118], t: 55, Hr: [-12, 16], A: [100, 143] },
    },
    ex_band_squat: {
      m: ['quad', 'glute'], band: 'foot',
      a: { h: [95, 77], t: 90, Hr: [-4, 12], A: [100, 143] },
      b: { h: [78, 118], t: 55, Hr: [-4, 12], A: [100, 143] },
    },
    ex_leg_press: {
      m: ['quad', 'glute'], hold: 'sled', gear: [['l', 40, 118, 10, 86, 7], ['l', 74, 124, 40, 118, 6], ['l', 60, 142, 170, 32, 4], ['l', 60, 142, 60, 150, 4]],
      a: { h: [70, 110], t: 150, H: [64, 100], A: [102, 78], f: 135 },
      b: { h: [70, 110], t: 150, H: [64, 100], A: [117, 63], f: 135 },
    },
    ex_lunges: {
      m: ['quad', 'glute'], hold: 'db',
      a: { h: [88, 82], t: 90, H: [90, 100], A: [116, 143], A2: [58, 138], f2: -60 },
      b: { h: [88, 105], t: 90, H: [90, 123], A: [118, 143], A2: [52, 138], f2: -60 },
    },
    ex_romanian_deadlift: {
      m: ['ham', 'glute', 'lowback'], hold: 'bar', pr: 16,
      a: { h: [90, 77], t: 90, H: [96, 127], A: [98, 143] },
      b: { h: [72, 82], t: 20, H: [110, 116], A: [98, 143] },
    },
    ex_band_rdl: {
      m: ['ham', 'glute', 'lowback'], band: 'foot',
      a: { h: [90, 77], t: 90, H: [96, 127], A: [98, 143] },
      b: { h: [72, 82], t: 20, H: [110, 116], A: [98, 143] },
    },
    ex_leg_curls: {
      m: ['ham'], hold: 'roller', gear: join(G.bench(50, 166, 110)),
      a: { h: [85, 100], t: 0, H: [146, 114], A: [18, 100], f: -150, e: -1 },
      b: { h: [85, 100], t: 0, H: [146, 114], A: [63, 69], f: 170, e: -1 },
    },
    ex_band_leg_curl: {
      m: ['ham'], band: [-8, 142], bandTo: 'ankle',
      a: { h: [85, 136], t: 0, H: [150, 145], A: [18, 138], f: -150 },
      b: { h: [85, 136], t: 0, H: [150, 145], A: [62, 104], f: 170 },
    },
    ex_seated_leg_curl: {
      m: ['ham'], hold: 'roller', gear: join(G.seat(76, 118, 109), [['l', 72, 48, 78, 108, 7]]),
      a: { h: [90, 100], t: 95, H: [116, 92], A: [158, 102], f: 70 },
      b: { h: [90, 100], t: 95, H: [116, 92], A: [110, 133], f: 15 },
    },
    ex_leg_extension: {
      m: ['quad'], hold: 'roller', gear: join(G.seat(76, 118, 109), [['l', 72, 48, 78, 108, 7]]),
      a: { h: [90, 100], t: 95, H: [84, 112], A: [110, 133], f: 15 },
      b: { h: [90, 100], t: 95, H: [84, 112], A: [158, 92], f: 70 },
    },
    ex_calf_raises: {
      m: ['calf'], gear: G.box(104, 122, 44, 28),
      a: { h: [96, 56], t: 90, H: [98, 106], A: [98, 122], f: 10 },
      b: { h: [96, 44], t: 90, H: [98, 94], A: [99, 110], f: -45 },
    },
    ex_hip_thrust: {
      m: ['glute', 'ham'], hold: 'bar', pr: 15, gear: G.bench(14, 60, 94),
      a: { h: [85, 122], t: 133, H: [88, 108], A: [125, 143] },
      b: { h: [98, 88], t: 178, H: [100, 74], A: [125, 143] },
    },
    ex_glute_bridge: {
      m: ['glute', 'ham'],
      a: { h: [85, 136], t: 180, H: [68, 146], A: [125, 143] },
      b: { h: [90, 112], t: 207, H: [68, 146], A: [125, 143] },
    },
    ex_single_leg_bridge: {
      m: ['glute', 'ham'],
      a: { h: [85, 136], t: 180, H: [68, 146], A: [125, 143], A2: [140, 108], f2: 60 },
      b: { h: [90, 112], t: 207, H: [68, 146], A: [125, 143], A2: [150, 90], f2: 60 },
    },
    ex_band_hip_thrust: {
      m: ['glute', 'ham'], band: [70, 148], bandTo: 'hip',
      a: { h: [85, 136], t: 180, H: [70, 146], A: [125, 143] },
      b: { h: [90, 112], t: 207, H: [70, 146], A: [125, 143] },
    },
    ex_bulgarian_split_squat: {
      m: ['quad', 'glute'], hold: 'db', gear: G.bench(18, 62, 106),
      a: { h: [92, 78], t: 90, H: [94, 128], A: [110, 143], A2: [50, 98], f2: -60 },
      b: { h: [85, 105], t: 85, H: [92, 138], A: [110, 143], A2: [50, 98], f2: -60 },
    },
    ex_kettlebell_swing: {
      m: ['glute', 'ham', 'lowback'], hold: 'kb',
      a: { h: [78, 82], t: 30, H: [112, 109], A: [100, 143] },
      b: { h: [98, 77], t: 90, H: [148, 38], A: [100, 143] },
    },
    // ---- shoulders
    ex_overhead_press: { m: ['delt', 'tri'], hold: 'bar', a: S({ H: [111, 26] }), b: S({ H: [100, -20] }) },
    ex_seated_db_press: {
      m: ['delt', 'tri'], hold: 'db', gear: join(G.seat(82, 122, 114), [['l', 86, 54, 90, 112, 7]]),
      a: C({ H: [111, 48] }), b: C({ H: [100, 8] }),
    },
    ex_lateral_raises: {
      front: true, m: ['delt'], hold: 'db',
      a: F({ H: [82, 84], e: 1 }), b: F({ H: [42, 34], e: 1 }),
    },
    ex_bent_arm_lateral: {
      front: true, m: ['delt'], hold: 'db',
      a: F({ H: [78, 62], e: 1 }), b: F({ H: [46, 26], e: 1 }),
    },
    ex_band_lateral_raise: {
      front: true, m: ['delt'], band: 'foot',
      a: F({ H: [80, 86], e: 1 }), b: F({ H: [46, 36], e: 1 }),
    },
    ex_upright_row: { m: ['delt', 'back'], hold: 'bar', a: S({ H: [104, 82] }), b: S({ H: [108, 36] }) },
    ex_rear_delt_flyes: {
      front: true, tl: 18, m: ['delt', 'back'], hold: 'db',
      a: { h: [100, 88], t: 90, H: [94, 118], A: [90, 143], k: -1, e: 1 },
      b: { h: [100, 88], t: 90, H: [50, 64], A: [90, 143], k: -1, e: 1 },
    },
    ex_band_pull_apart: {
      front: true, m: ['delt', 'back'], band: 'span',
      a: F({ H: [90, 42], e: 1 }), b: F({ H: [50, 38], e: 1 }),
    },
    ex_face_pull: {
      m: ['delt', 'back'], hold: 'handle', cable: [182, 30], gear: join(G.post(182, 34), [['o', 182, 30, 4, 2.5]]),
      a: S({ H: [150, 34] }), b: S({ H: [118, 22] }),
    },
    ex_band_face_pull: {
      m: ['delt', 'back'], band: [182, 30], hold: 'handle', gear: G.door(184, 4, 150),
      a: S({ H: [150, 34] }), b: S({ H: [118, 22] }),
    },
    ex_pike_pushups: {
      m: ['delt', 'tri'],
      a: { h: [80, 74], t: -40, H: [134, 147], A: [56, 136], f: -60 },
      b: { h: [80, 82], t: -60, H: [134, 147], A: [56, 136], f: -60 },
    },
    // ---- arms
    ex_barbell_curl: { m: ['bi'], hold: 'bar', a: S({ H: [104, 82] }), b: S({ H: [120, 42] }) },
    ex_hammer_curls: { m: ['bi', 'fore'], hold: 'db', a: S({ H: [104, 82] }), b: S({ H: [120, 42] }) },
    ex_band_curl: { m: ['bi'], band: 'foot', hold: 'handle', a: S({ H: [104, 82] }), b: S({ H: [120, 42] }) },
    ex_preacher_curls: {
      m: ['bi'], hold: 'bar', pr: 12, gear: join([['l', 106, 88, 130, 74, 7], ['l', 122, 80, 122, 150, 4]], G.seat(72, 102, 114)),
      a: { h: [85, 105], t: 80, H: [146, 96], A: [132, 143] },
      b: { h: [85, 105], t: 80, H: [130, 50], A: [132, 143] },
    },
    ex_incline_curl: {
      m: ['bi'], hold: 'db', gear: join(G.pad(92, 114, 44, 58), [['l', 74, 92, 74, 150, 4], ['l', 92, 114, 130, 114, 6], ['l', 112, 114, 112, 150, 4]]),
      a: { h: [100, 105], t: 125, H: [62, 117], A: [155, 143] },
      b: { h: [100, 105], t: 125, H: [86, 76], A: [155, 143] },
    },
    ex_skull_crushers: {
      m: ['tri'], hold: 'bar', pr: 11, gear: G.bench(42, 130, 100),
      a: L_({ H: [50, 62] }), b: L_({ H: [72, 40] }),
    },
    ex_tricep_pushdown: {
      m: ['tri'], hold: 'handle', cable: [136, -8], gear: join(G.post(136, -4), [['o', 136, -8, 4, 2.5]]),
      a: S({ t: 85, H: [124, 44], A: [100, 143] }), b: S({ t: 85, H: [110, 84], A: [100, 143] }),
    },
    ex_overhead_triceps_ext: {
      m: ['tri'], hold: 'handle', cable: [36, 122], gear: join(G.post(36, 126), [['o', 36, 122, 4, 2.5]]),
      a: S({ t: 82, A: [108, 143], A2: [80, 143], H: [84, 20] }), b: S({ t: 82, A: [108, 143], A2: [80, 143], H: [114, -18] }),
    },
    ex_band_overhead_ext: {
      m: ['tri'], band: [34, 148], hold: 'handle',
      a: S({ t: 82, A: [108, 143], A2: [66, 143], H: [84, 20] }), b: S({ t: 82, A: [108, 143], A2: [66, 143], H: [114, -18] }),
    },
    ex_bench_dips: {
      m: ['tri', 'chest'], gear: G.bench(26, 72, 95),
      a: { h: [72, 90], t: 98, H: [62, 95], A: [115, 143] },
      b: { h: [72, 118], t: 95, H: [62, 95], A: [115, 143] },
    },
    // ---- core
    ex_plank: {
      m: ['abs'],
      a: { h: [78, 126], t: 5, H: [149, 146], A: [14, 136], f: -70 },
      b: { h: [78, 124], t: 5, H: [149, 146], A: [14, 136], f: -70 },
    },
    ex_crunches: {
      m: ['abs'],
      a: { h: [90, 136], t: 176, Hr: [-6, 11], A: [126, 143] },
      b: { h: [90, 136], t: 150, Hr: [-6, 11], A: [126, 143] },
    },
    ex_hanging_leg_raises: {
      noFloor: true, m: ['abs'], gear: [['l', 84, 15, 122, 15, 4], ['l', 122, 15, 122, 3, 4]],
      a: { h: [100, 111], t: 90, H: [100, 15], A: [98, 178], f: -30 },
      b: { h: [100, 111], t: 90, H: [100, 15], A: [166, 104], f: 60 },
    },
    ex_hanging_knee_raise: {
      noFloor: true, m: ['abs'], gear: [['l', 84, 15, 122, 15, 4], ['l', 122, 15, 122, 3, 4]],
      a: { h: [100, 111], t: 90, H: [100, 15], A: [98, 178], f: -30 },
      b: { h: [100, 111], t: 90, H: [100, 15], A: [130, 133], f: 0 },
    },
    ex_l_sit: {
      m: ['abs', 'quad', 'tri'], gear: [['l', 86, 100, 126, 100, 5], ['l', 120, 100, 120, 150, 4], ['l', 92, 100, 92, 150, 4]],
      a: { h: [100, 97], t: 90, H: [104, 100], A: [165, 100], f: 80 },
      b: { h: [100, 95], t: 90, H: [104, 100], A: [165, 96], f: 80 },
    },
    ex_russian_twists: {
      m: ['abs'], hold: 'db',
      a: { h: [70, 136], t: 130, H: [72, 130], A: [136, 118], f: 30 },
      b: { h: [70, 136], t: 130, H: [90, 100], A: [136, 118], f: 30 },
    },
    ex_stomach_vacuum: {
      m: ['abs'],
      a: S({ Hr: [-24, 10] }), b: S({ Hr: [-24, 9], h: [99, 77] }),
    },
    ex_dead_bug: {
      m: ['abs'],
      a: { h: [100, 136], t: 180, H: [54, 86], H2: [56, 85], A: [136, 106], A2: [132, 106], f: 15, f2: 15 },
      b: { h: [100, 136], t: 180, H: [12, 128], H2: [56, 85], A: [166, 136], A2: [132, 106], f: 40, f2: 15 },
    },
    ex_bird_dog: {
      m: ['abs', 'lowback', 'glute'],
      a: { h: [72, 100], t: 0, H: [118, 146], H2: [121, 146], A: [40, 141], A2: [44, 141], f: -170, f2: -170 },
      b: { h: [72, 100], t: 0, H: [168, 92], H2: [121, 146], A: [6, 94], A2: [44, 141], f: -170, f2: -170 },
    },
    ex_side_plank: {
      m: ['abs'],
      a: { h: [80, 124], t: 16, H: [126, 148], H2: [126, 60], A: [16, 142], A2: [20, 142], f: 80, e: -1, e2: -1 },
      b: { h: [80, 118], t: 20, H: [126, 148], H2: [126, 56], A: [16, 142], A2: [20, 142], f: 80, e: -1, e2: -1 },
    },
    ex_band_pallof: {
      m: ['abs'], band: [28, 54], gear: G.door(26, 8, 150),
      a: S({ H: [114, 50], A: [106, 143] }), b: S({ H: [150, 48], A: [106, 143] }),
    },
    // ---- cardio
    ex_hiit_bike: {
      m: ['quad', 'glute'], gear: [['o', 124, 124, 22, 5], ['l', 84, 84, 124, 124, 4], ['l', 124, 124, 150, 62, 4], ['l', 76, 84, 96, 84, 6], ['l', 140, 58, 158, 58, 5], ['l', 95, 148, 155, 148, 4]],
      a: { h: [86, 76], t: 58, H: [146, 58], A: [116, 137], A2: [100, 104], f: 0, f2: 0 },
      b: { h: [86, 76], t: 58, H: [146, 58], A: [100, 104], A2: [116, 137], f: 0, f2: 0 },
    },
    ex_incline_walk: {
      m: ['glute', 'calf'], noFloor: true, gear: [['l', 30, 150, 170, 132, 6], ['l', 160, 134, 168, 50, 4], ['l', 150, 52, 172, 52, 4]],
      a: { h: [100, 72], t: 86, H: [118, 96], H2: [84, 94], A: [124, 128], A2: [78, 136], f: 15, f2: -20 },
      b: { h: [100, 72], t: 86, H: [84, 94], H2: [118, 96], A: [78, 136], A2: [124, 128], f: -20, f2: 15 },
    },
    ex_burpee: {
      m: ['chest', 'quad', 'abs'],
      a: { h: [100, 72], t: 90, H: [100, -22], A: [100, 138], f: -10 },
      b: { h: [78, 105], t: 14, H: [124, 145], A: [14, 128], f: -70 },
    },
    ex_jump_rope: {
      front: true, m: ['calf'], band: 'span',
      a: F({ H: [62, 84], e: 1, A: [92, 143] }), b: F({ h: [100, 67], H: [62, 74], e: 1, A: [92, 133] }),
    },
    ex_mountain_climbers: {
      m: ['abs', 'quad'],
      a: { h: [78, 100], t: 10, H: [124, 145], A: [84, 132], A2: [14, 128], f: -60, f2: -70 },
      b: { h: [78, 100], t: 10, H: [124, 145], A: [14, 128], A2: [84, 132], f: -70, f2: -60 },
    },
  };

  // ---------- rendering ----------
  const cache = {};
  function prepared(id) {
    if (cache[id]) return cache[id];
    const def = FIGURES[id];
    if (!def) return null;
    const a = normalise(def, def.a);
    const b = normalise(def, def.b);
    const bodyA = bodyParts(def, a);
    const bodyB = bodyParts(def, b);

    const bounds = [Infinity, Infinity, -Infinity, -Infinity];
    const grow = (p, r) => {
      bounds[0] = Math.min(bounds[0], p[0] - r); bounds[1] = Math.min(bounds[1], p[1] - r);
      bounds[2] = Math.max(bounds[2], p[0] + r); bounds[3] = Math.max(bounds[3], p[1] + r);
    };
    const hasPlate = def.hold === 'bar';
    [bodyA.J, bodyB.J].forEach((J) => {
      grow(J.head, 9);
      [J.hip, J.shoulder, J.eN, J.eF, J.kN, J.kF, J.aN, J.aF, J.tN, J.tF].forEach((p) => grow(p, 7));
      [J.hdN, J.hdF].forEach((p) => grow(p, hasPlate ? (def.pr || 14) + 1 : def.hold === 'db' ? 14 : def.hold === 'kb' ? 18 : 6));
    });
    (def.gear || []).forEach((item) => gearBounds(item, bounds));
    if (Array.isArray(def.cable) && Array.isArray(def.cable[0])) def.cable.forEach((p) => grow(p, 5));
    else if (Array.isArray(def.cable)) grow(def.cable, 5);
    if (Array.isArray(def.band) && !Array.isArray(def.band[0])) grow(def.band, 3);
    if (!def.noFloor) grow([bounds[0], FLOOR], 1);

    // Fit to a fixed 5:4 box so thumbnails line up in a grid.
    let w = Math.max(bounds[2] - bounds[0] + 16, 150);
    let h = Math.max(bounds[3] - bounds[1] + 16, 120);
    if (w / h < 1.25) w = h * 1.25; else h = w / 1.25;
    const cx = (bounds[0] + bounds[2]) / 2;
    const bottom = def.noFloor ? (bounds[1] + bounds[3]) / 2 + h / 2 : Math.max(bounds[3] + 8, FLOOR + 8);
    const box = [R(cx - w / 2), R(bottom - h), R(w), R(h)];

    const floor = def.noFloor ? '' : `<path class="fig-floor" d="M${box[0]} ${FLOOR}H${R(box[0] + box[2])}"/>`;
    const gear = (def.gear || []).map(gearMarkup).join('');
    cache[id] = { def: def, a: a, b: b, partsA: bodyA.parts, partsB: bodyB.parts, box: box, floor: floor, gear: gear };
    return cache[id];
  }

  const paths = (parts, skipMuscle) => parts
    .filter((p) => !(skipMuscle && p[0] === 'fig-muscle'))
    .map((p) => `<path class="${p[0]}" d="${p[1]}"/>`).join('');

  function wrap(fig, inner, label) {
    return `<svg class="ex-fig" viewBox="${fig.box.join(' ')}" role="img" aria-label="${label || 'Техника упражнения'}">${fig.floor}${fig.gear}${inner}</svg>`;
  }

  window.BentoFigures = {
    has: (id) => !!FIGURES[id],
    ids: () => Object.keys(FIGURES),

    // mode: 'motion' (start ghosted under finish), 'start', 'finish'
    svg: function (id, mode, label) {
      const fig = prepared(id);
      if (!fig) return '';
      if (mode === 'start') return wrap(fig, paths(fig.partsA), label);
      if (mode === 'finish') return wrap(fig, paths(fig.partsB), label);
      return wrap(fig, `<g class="fig-ghost">${paths(fig.partsA, true)}</g>${paths(fig.partsB)}`, label);
    },

    // Loops start → finish in el; stops itself once el leaves the page or gets hidden.
    mount: function (el, id, label) {
      const fig = prepared(id);
      if (!el || !fig) return;
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        el.innerHTML = this.svg(id, 'motion', label);
        return;
      }
      el.innerHTML = wrap(fig, paths(fig.partsA), label);
      const svg = el.querySelector('svg');
      const gearCount = svg.children.length - fig.partsA.length;
      const nodes = Array.prototype.slice.call(svg.children, gearCount);
      const CYCLE = 2800;
      const start = performance.now();
      const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);
      const tick = (now) => {
        if (!el.isConnected || svg.parentNode !== el) return;
        if (el.getClientRects().length > 0) {
          const phase = ((now - start) % CYCLE) / CYCLE;
          let k = 0;
          if (phase < 0.08) k = 0;
          else if (phase < 0.44) k = ease((phase - 0.08) / 0.36);
          else if (phase < 0.54) k = 1;
          else if (phase < 0.96) k = 1 - ease((phase - 0.54) / 0.42);
          const parts = bodyParts(fig.def, lerpPose(fig.a, fig.b, k)).parts;
          for (let i = 0; i < nodes.length && i < parts.length; i++) {
            nodes[i].setAttribute('d', parts[i][1]);
          }
          window.requestAnimationFrame(tick);
        }
      };
      window.requestAnimationFrame(tick);
    },
  };
})();
