'use strict';
/* Per-user progress: one JSON document, changed only through small "ops" ({p: path, v: value, t: client time}).
   Merge rules make every device converge on the same result, whatever order the changes arrive in:
   - finished QT days, claimed gifts and unlocked items only ever get added (a reward can't be claimed twice or lost)
   - each sticker is kept from the first time it was earned (no duplicates)
   - notes, handwriting, answers, outfit, language etc.: the most recent change wins, per item */

const KEY_RE = /^[0-9A-Za-z_-]{1,40}$/;
const ID_RE = /^[a-z0-9_]{1,40}$/;
const DATE_RE = /^\d{4}-\d{1,2}-\d{1,2}$/;
const NOTE_RE = /^\d{4}-\d{1,2}-\d{1,2}-(mon|tue|wed|thu|fri)$/;
const ANSWER_RE = /^\d{4}-\d{1,2}-\d{1,2}-\d{1,2}$/;
const SLOTS = ['shirt', 'bottom', 'hair', 'shoes', 'head', 'face', 'acc'];

const FIELDS = {
  onboarded: { kind: 'scalar', ok: v => typeof v === 'boolean' },
  lang:      { kind: 'scalar', ok: v => v === 'ko' || v === 'en' },
  gender:    { kind: 'scalar', ok: v => v === 'boy' || v === 'girl' },
  avatar:    { kind: 'scalar', ok: v => Number.isInteger(v) && v >= 1 && v <= 3 },
  equipped:  { kind: 'scalar', ok: v => typeof v === 'string' && ID_RE.test(v) },
  days:      { kind: 'union', key: DATE_RE },
  claimed:   { kind: 'union', key: DATE_RE },
  unlocked:  { kind: 'set' },
  stickers:  { kind: 'first', key: /^(mem-)?\d{4}-\d{1,2}-\d{1,2}-(mon|tue|wed|thu|fri)$/, ok: v => v && typeof v === 'object' && typeof v.kind === 'string' && ID_RE.test(v.kind) && Number.isFinite(v.at) },
  notes:     { kind: 'lww', key: NOTE_RE, ok: v => typeof v === 'string' && v.length <= 1000 },
  noteMode:  { kind: 'lww', key: NOTE_RE, ok: v => v === 'type' || v === 'hand' },
  ink:       { kind: 'lww', key: NOTE_RE, ok: validInk },
  answers:   { kind: 'lww', key: ANSWER_RE, ok: validAnswer },
  qink:      { kind: 'lww', key: ANSWER_RE, ok: validInk },
  memory:    { kind: 'union', key: NOTE_RE },
  bible:     { kind: 'lww', key: DATE_RE, ok: v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length <= 3 && typeof v.id === 'string' && /^[a-z0-9-]{1,40}$/.test(v.id) && Number.isInteger(v.p) && v.p >= 0 && v.p <= 300 },
  bibleDone: { kind: 'union', key: DATE_RE },
  flipSound: { kind: 'scalar', ok: v => typeof v === 'boolean' },
  outfit:    { kind: 'lww', key: /^(shirt|bottom|hair|shoes|head|face|acc)$/, ok: v => typeof v === 'string' && ID_RE.test(v) }
};

const MAX_STATE_BYTES = 8 * 1024 * 1024;

function validInk(v) {
  if (!Array.isArray(v) || v.length > 800) return false;
  let pts = 0;
  for (const s of v) {
    if (!s || typeof s !== 'object' || Array.isArray(s)) return false;
    if (typeof s.c !== 'string' || !/^#[0-9A-Fa-f]{3,8}$/.test(s.c)) return false;
    if (typeof s.w !== 'number' || !(s.w > 0 && s.w < 0.2)) return false;
    if (!Array.isArray(s.p) || s.p.length % 3 !== 0) return false;
    pts += s.p.length;
    if (pts > 150000) return false;
    for (const n of s.p) if (!Number.isInteger(n) || n < -100000 || n > 1000000) return false;
  }
  return true;
}
function validAnswer(v) {
  if (typeof v === 'string') return v.length <= 1000;
  if (Array.isArray(v)) return v.length <= 10 && v.every(x => typeof x === 'string' && x.length <= 200);
  return false;
}

function defaults(lang) {
  return {
    onboarded: false, lang: lang === 'en' ? 'en' : 'ko', gender: 'boy', avatar: 1, equipped: 'starter',
    days: {}, claimed: {}, unlocked: ['starter'], stickers: {}, memory: {}, bible: {}, bibleDone: {}, flipSound: true, qink: {},
    notes: {}, noteMode: {}, ink: {}, answers: {}, outfit: {}
  };
}

/* make sure a stored document has every field (older rows, or fields added later) */
function normalize(state) {
  const d = defaults(state && state.lang);
  const s = Object.assign(d, state && typeof state === 'object' ? state : {});
  for (const f of ['days', 'claimed', 'stickers', 'memory', 'bible', 'bibleDone', 'notes', 'noteMode', 'ink', 'answers', 'outfit', 'qink']) {
    if (!s[f] || typeof s[f] !== 'object' || Array.isArray(s[f])) s[f] = {};
  }
  if (!Array.isArray(s.unlocked)) s.unlocked = ['starter'];
  if (s.unlocked.indexOf('starter') < 0) s.unlocked.unshift('starter');
  return s;
}

/* Apply ops to (state, stamps). Returns { changed, rejected: [paths] }.
   now = server time; a client clock that runs ahead can't make its edits win forever. */
function applyOps(state, stamps, ops, now, opts) {
  opts = opts || {};
  let changed = false;
  const rejected = [];
  if (!Array.isArray(ops)) return { changed, rejected: ['*'] };
  for (const op of ops) {
    if (!op || typeof op.p !== 'string' || op.p.length > 90) { rejected.push(String(op && op.p)); continue; }
    const dot = op.p.indexOf('.');
    const field = dot < 0 ? op.p : op.p.slice(0, dot);
    const key = dot < 0 ? null : op.p.slice(dot + 1);
    const spec = Object.prototype.hasOwnProperty.call(FIELDS, field) ? FIELDS[field] : null;
    if (!spec) { rejected.push(op.p); continue; }
    let t = Number(op.t);
    if (!Number.isFinite(t) || t <= 0) t = now;
    if (opts.forceT) t = opts.forceT;
    t = Math.min(Math.floor(t), now);
    const v = op.v;

    if (spec.kind === 'scalar') {
      if (key !== null || !spec.ok(v)) { rejected.push(op.p); continue; }
      if (t >= (stamps[field] || 0)) {
        if (state[field] !== v) changed = true;
        state[field] = v; stamps[field] = t;
      }
      continue;
    }
    if (spec.kind === 'set') {
      if (key !== null || !Array.isArray(v) || v.length > 500 || !v.every(x => typeof x === 'string' && ID_RE.test(x))) { rejected.push(op.p); continue; }
      for (const id of v) if (state.unlocked.indexOf(id) < 0) { state.unlocked.push(id); changed = true; }
      continue;
    }
    if (key === null || !KEY_RE.test(key) || (spec.key && !spec.key.test(key))) { rejected.push(op.p); continue; }
    const map = state[field];
    if (spec.kind === 'union') {
      if (v !== true) { rejected.push(op.p); continue; }
      if (map[key] !== true) { map[key] = true; changed = true; }
      continue;
    }
    if (spec.kind === 'first') {
      if (!spec.ok(v)) { rejected.push(op.p); continue; }
      if (!map[key]) { map[key] = { kind: v.kind, at: Math.floor(v.at) }; changed = true; }
      continue;
    }
    /* lww */
    if (v !== null && !spec.ok(v)) { rejected.push(op.p); continue; }
    const sk = field + '.' + key;
    if (t >= (stamps[sk] || 0)) {
      const before = JSON.stringify(map[key]);
      if (v === null) delete map[key]; else map[key] = v;
      stamps[sk] = t;
      if (JSON.stringify(map[key]) !== before) changed = true;
    }
  }
  return { changed, rejected };
}

/* turn a whole local (pre-account) state into ops, used to link old device progress to an account */
function stateToOps(local) {
  const ops = [];
  if (!local || typeof local !== 'object') return ops;
  for (const f of Object.keys(FIELDS)) {
    if (!(f in local)) continue;
    const spec = FIELDS[f], val = local[f];
    if (spec.kind === 'scalar' || spec.kind === 'set') { ops.push({ p: f, v: val }); continue; }
    if (!val || typeof val !== 'object' || Array.isArray(val)) continue;
    for (const k of Object.keys(val)) ops.push({ p: f + '.' + k, v: val[k] });
  }
  return ops;
}

function sizeOk(state) {
  return Buffer.byteLength(JSON.stringify(state)) <= MAX_STATE_BYTES;
}

module.exports = { defaults, normalize, applyOps, stateToOps, sizeOk, FIELDS, SLOTS };
