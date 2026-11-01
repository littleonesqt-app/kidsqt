'use strict';
/* API tests: node --test test/  (starts a throwaway server with its own empty database) */
process.removeAllListeners('warning');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../server/app');

let server, base, app, dir;
test.before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iamkids-test-'));
  app = createApp({ dataDir: dir, cookieSecure: false });
  await new Promise(r => { server = app.listen(0, '127.0.0.1', r); });
  base = 'http://127.0.0.1:' + server.address().port;
});
test.after(() => { server.close(); app.locals.close(); fs.rmSync(dir, { recursive: true, force: true }); });

/* a tiny client that keeps its own cookie, like one browser/device */
function device() {
  let cookie = '';
  return async function call(method, url, body, headers) {
    const h = Object.assign({ 'content-type': 'application/json', 'x-iam-client': '1' }, headers || {});
    if (cookie) h.cookie = cookie;
    const r = await fetch(base + url, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
    const sc = r.headers.get('set-cookie');
    if (sc) { const m = /iamkids_sid=([^;]*)/.exec(sc); cookie = m && m[1] ? 'iamkids_sid=' + m[1] : ''; }
    let data = null; try { data = await r.json(); } catch (_) {}
    return { status: r.status, data, setCookie: sc };
  };
}

test('sign up with only a username and password, then use the account on a second device', async () => {
  const ipad = device();
  let r = await ipad('POST', '/api/auth/signup', { username: 'HappyKid123', password: 'sunny-day', lang: 'ko' });
  assert.equal(r.status, 201);
  assert.equal(r.data.user.username, 'happykid123');
  assert.match(r.data.recoveryCode, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.match(r.setCookie, /HttpOnly/i);
  assert.match(r.setCookie, /SameSite=Lax/i);

  r = await ipad('GET', '/api/auth/me');
  assert.equal(r.status, 200);

  r = await ipad('POST', '/api/progress/patch', { ops: [
    { p: 'days.2026-10-19', v: true, t: Date.now() },
    { p: 'answers.2026-10-19-2', v: '예수님은 어떤 분일까?', t: Date.now() },
    { p: 'notes.2026-10-19-mon', v: '친구가 도와줘서 감사해요', t: Date.now() },
    { p: 'stickers.2026-10-19-mon', v: { kind: 'mon', at: 111 }, t: Date.now() },
    { p: 'outfit.shoes', v: 's_pink', t: Date.now() },
    { p: 'onboarded', v: true, t: Date.now() }
  ] });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.rejected, []);

  const pc = device();
  r = await pc('GET', '/api/progress');
  assert.equal(r.status, 401, 'not signed in yet on the computer');
  r = await pc('POST', '/api/auth/login', { username: 'happykid123', password: 'sunny-day' });
  assert.equal(r.status, 200);
  r = await pc('GET', '/api/progress');
  assert.equal(r.data.state.days['2026-10-19'], true);
  assert.equal(r.data.state.answers['2026-10-19-2'], '예수님은 어떤 분일까?');
  assert.equal(r.data.state.notes['2026-10-19-mon'], '친구가 도와줘서 감사해요');
  assert.equal(r.data.state.outfit.shoes, 's_pink');
  assert.equal(r.data.state.stickers['2026-10-19-mon'].kind, 'mon');
});

test('usernames are unique and checked before sign-up', async () => {
  const d = device();
  let r = await d('GET', '/api/auth/username-available?u=happykid123');
  assert.equal(r.data.available, false);
  r = await d('GET', '/api/auth/username-available?u=newkid_9');
  assert.equal(r.data.available, true);
  r = await d('POST', '/api/auth/signup', { username: 'HAPPYKID123', password: 'other-pass' });
  assert.equal(r.status, 409);
  assert.equal(r.data.error, 'username_taken');
  r = await d('POST', '/api/auth/signup', { username: 'ab', password: 'other-pass' });
  assert.equal(r.data.error, 'username_invalid');
  r = await d('POST', '/api/auth/signup', { username: 'kidtest', password: '123456' });
  assert.equal(r.data.error, 'password_weak');
  r = await d('POST', '/api/auth/signup', { username: 'kidtest', password: 'abc' });
  assert.equal(r.data.error, 'password_too_short');
});

test('one account can never see or change another account', async () => {
  const a = device(), b = device();
  await a('POST', '/api/auth/signup', { username: 'kid_alpha', password: 'alpha-pass' });
  await b('POST', '/api/auth/signup', { username: 'kid_beta', password: 'beta-pass' });
  await a('POST', '/api/progress/patch', { ops: [{ p: 'notes.2026-10-20-tue', v: 'alpha secret', t: Date.now() }] });
  const r = await b('GET', '/api/progress');
  assert.equal(r.data.state.notes['2026-10-20-tue'], undefined);
  /* there is no way to address another user's data: the API only uses the signed-in session */
  const r2 = await b('POST', '/api/progress/patch', { ops: [{ p: 'notes.2026-10-20-tue', v: 'beta', t: Date.now() }], user_id: 'whatever' });
  assert.equal(r2.status, 200);
  const r3 = await a('GET', '/api/progress');
  assert.equal(r3.data.state.notes['2026-10-20-tue'], 'alpha secret');
});

test('merge rules: rewards only add, stickers never duplicate, newest note wins, future clocks are capped', async () => {
  const d = device();
  await d('POST', '/api/auth/signup', { username: 'kid_merge', password: 'merge-pass' });
  const now = Date.now();
  let r = await d('POST', '/api/progress/patch', { ops: [
    { p: 'claimed.2026-10-19', v: true, t: now },
    { p: 'unlocked', v: ['starter', 'mint', 'star'], t: now },
    { p: 'stickers.2026-10-19-mon', v: { kind: 'mon', at: 100 }, t: now },
    { p: 'notes.2026-10-19-mon', v: 'newer', t: now }
  ] });
  r = await d('POST', '/api/progress/patch', { ops: [
    { p: 'claimed.2026-10-19', v: false, t: now + 5 },              // can't un-claim
    { p: 'unlocked', v: ['starter'], t: now + 5 },                   // can't lose items
    { p: 'stickers.2026-10-19-mon', v: { kind: 'mon', at: 999 } },   // second award ignored
    { p: 'notes.2026-10-19-mon', v: 'older offline edit', t: now - 60000 }
  ] });
  assert.equal(r.data.state.claimed['2026-10-19'], true);
  assert.deepEqual(r.data.state.unlocked.sort(), ['mint', 'star', 'starter']);
  assert.equal(r.data.state.stickers['2026-10-19-mon'].at, 100);
  assert.equal(Object.keys(r.data.state.stickers).length, 1);
  assert.equal(r.data.state.notes['2026-10-19-mon'], 'newer');
  assert.deepEqual(r.data.rejected, ['claimed.2026-10-19']);

  /* a device whose clock is a year ahead can't lock a note forever */
  await d('POST', '/api/progress/patch', { ops: [{ p: 'notes.2026-10-21-wed', v: 'from the future', t: now + 365 * 864e5 }] });
  r = await d('POST', '/api/progress/patch', { ops: [{ p: 'notes.2026-10-21-wed', v: 'fixed later', t: Date.now() + 10 }] });
  assert.equal(r.data.state.notes['2026-10-21-wed'], 'fixed later');

  /* junk is rejected, not stored */
  r = await d('POST', '/api/progress/patch', { ops: [{ p: '__proto__.x', v: 1 }, { p: 'notes.../x', v: 'a' }, { p: 'ink.2026-10-19-mon', v: [{ c: 'red', w: 1, p: [1] }] }, { p: 'lang', v: 'fr' }] });
  assert.equal(r.data.rejected.length, 4);
});

test('progress from before accounts only fills gaps and never overwrites the cloud', async () => {
  const d = device();
  await d('POST', '/api/auth/signup', { username: 'kid_import', password: 'import-pass' });
  await d('POST', '/api/progress/patch', { ops: [{ p: 'notes.2026-10-19-mon', v: 'cloud note', t: Date.now() }, { p: 'gender', v: 'girl', t: Date.now() }] });
  const local = { onboarded: true, gender: 'boy', avatar: 2, days: { '2026-10-12': true, '2026-10-13': true },
    notes: { '2026-10-19-mon': 'old local note', '2026-10-13-tue': 'only local' },
    stickers: { '2026-10-13-tue': { kind: 'tue', at: 5 } }, unlocked: ['starter', 'heart'], equipped: 'heart' };
  const r = await d('POST', '/api/progress/import', { state: local });
  const s = r.data.state;
  assert.equal(s.notes['2026-10-19-mon'], 'cloud note');
  assert.equal(s.notes['2026-10-13-tue'], 'only local');
  assert.equal(s.gender, 'girl');
  assert.equal(s.avatar, 2);
  assert.equal(s.onboarded, true);
  assert.equal(s.days['2026-10-12'], true);
  assert.ok(s.unlocked.includes('heart'));
  assert.equal(s.stickers['2026-10-13-tue'].kind, 'tue');
});

test('change password checks the current one and signs out other devices', async () => {
  const one = device(), two = device();
  await one('POST', '/api/auth/signup', { username: 'kid_pw', password: 'first-pass' });
  await two('POST', '/api/auth/login', { username: 'kid_pw', password: 'first-pass' });
  let r = await one('POST', '/api/auth/change-password', { current: 'wrong-pass', next: 'second-pass' });
  assert.equal(r.data.error, 'current_password_wrong');
  r = await one('POST', '/api/auth/change-password', { current: 'first-pass', next: 'second-pass' });
  assert.equal(r.status, 200);
  assert.equal((await one('GET', '/api/auth/me')).status, 200);
  assert.equal((await two('GET', '/api/auth/me')).status, 401);
  assert.equal((await device()('POST', '/api/auth/login', { username: 'kid_pw', password: 'first-pass' })).status, 401);
  assert.equal((await device()('POST', '/api/auth/login', { username: 'kid_pw', password: 'second-pass' })).status, 200);
});

test('a forgotten password can be reset once with the recovery code', async () => {
  const d = device();
  const s = await d('POST', '/api/auth/signup', { username: 'kid_forgot', password: 'forgot-pass' });
  const code = s.data.recoveryCode;
  const other = device();
  let r = await other('POST', '/api/auth/recover', { username: 'kid_forgot', code: 'AAAA-BBBB-CCCC', newPassword: 'brand-new-1' });
  assert.equal(r.data.error, 'recovery_invalid');
  r = await other('POST', '/api/auth/recover', { username: 'kid_forgot', code: code.toLowerCase().replace(/-/g, ' '), newPassword: 'brand-new-1' });
  assert.equal(r.status, 200);
  assert.notEqual(r.data.recoveryCode, code);
  assert.equal((await d('GET', '/api/auth/me')).status, 401, 'old sessions end');
  r = await device()('POST', '/api/auth/recover', { username: 'kid_forgot', code, newPassword: 'brand-new-2' });
  assert.equal(r.data.error, 'recovery_invalid', 'the old code works only once');
  assert.equal((await device()('POST', '/api/auth/login', { username: 'kid_forgot', password: 'brand-new-1' })).status, 200);
});

test('repeated wrong passwords lock the username for a while', async () => {
  await device()('POST', '/api/auth/signup', { username: 'kid_lock', password: 'lock-pass' });
  const d = device();
  for (let i = 0; i < 5; i++) assert.equal((await d('POST', '/api/auth/login', { username: 'kid_lock', password: 'nope-' + i })).status, 401);
  const r = await d('POST', '/api/auth/login', { username: 'kid_lock', password: 'lock-pass' });
  assert.equal(r.status, 429);
  assert.ok(r.data.retryAfter > 0);
});

test('requests from other websites are refused', async () => {
  const d = device();
  let r = await d('POST', '/api/auth/login', { username: 'x', password: 'y' }, { 'x-iam-client': '' });
  assert.equal(r.status, 403);
  r = await d('POST', '/api/auth/login', { username: 'x', password: 'y' }, { origin: 'https://evil.example' });
  assert.equal(r.status, 403);
});

test('logging out ends the session; deleting the account removes everything', async () => {
  const d = device();
  await d('POST', '/api/auth/signup', { username: 'kid_bye', password: 'bye-pass-1' });
  await d('POST', '/api/auth/logout', {});
  assert.equal((await d('GET', '/api/auth/me')).status, 401);
  await d('POST', '/api/auth/login', { username: 'kid_bye', password: 'bye-pass-1' });
  let r = await d('DELETE', '/api/account', { password: 'wrong' });
  assert.equal(r.status, 401);
  r = await d('DELETE', '/api/account', { password: 'bye-pass-1' });
  assert.equal(r.status, 200);
  assert.equal((await device()('POST', '/api/auth/login', { username: 'kid_bye', password: 'bye-pass-1' })).status, 401);
  const row = app.locals.store.db.prepare("SELECT COUNT(*) n FROM progress p LEFT JOIN users u ON u.id=p.user_id WHERE u.id IS NULL").get();
  assert.equal(row.n, 0);
});

test('passwords and tokens are never stored in plain text', async () => {
  const rows = app.locals.store.db.prepare('SELECT pw_hash, recovery_hash FROM users').all();
  assert.ok(rows.length > 0);
  for (const r of rows) { assert.match(r.pw_hash, /^\$argon2id\$/); assert.match(r.recovery_hash, /^\$argon2id\$/); }
  const s = app.locals.store.db.prepare('SELECT token_hash FROM sessions').all();
  for (const r of s) assert.match(r.token_hash, /^[0-9a-f]{64}$/);
});

test('memory-verse recordings: upload, list, play, delete; owner only; bad files refused; newest 5 kept', async () => {
  const me = device(), other = device();
  await me('POST', '/api/auth/signup', { username: 'kid_voice', password: 'voice-pass' });
  await other('POST', '/api/auth/signup', { username: 'kid_other', password: 'other-pass' });
  const webm = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(3000, 7)]);
  /* raw uploads need the cookie, so log in through a small raw client */
  async function raw(username, password) {
    const l = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json', 'x-iam-client': '1' }, body: JSON.stringify({ username, password }) });
    const ck = /iamkids_sid=([^;]*)/.exec(l.headers.get('set-cookie'))[1];
    return (method, url, body, type) => fetch(base + url, { method, headers: Object.assign({ cookie: 'iamkids_sid=' + ck, 'x-iam-client': '1' }, type ? { 'content-type': type } : {}), body });
  }
  const A1 = await raw('kid_voice', 'voice-pass'), B1 = await raw('kid_other', 'other-pass');
  let r = await A1('POST', '/api/recordings?verse=col-1-15&week=2026-10-19', webm, 'audio/webm;codecs=opus');
  assert.equal(r.status, 201);
  const rec = (await r.json()).recording;
  r = await A1('GET', '/api/recordings');
  assert.equal((await r.json()).recordings.length, 1);
  r = await A1('GET', '/api/recordings/' + rec.id);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'audio/webm');
  assert.equal(Buffer.from(await r.arrayBuffer()).length, webm.length);
  /* another child can't see, play or delete it */
  assert.equal((await (await B1('GET', '/api/recordings')).json()).recordings.length, 0);
  assert.equal((await B1('GET', '/api/recordings/' + rec.id)).status, 404);
  assert.equal((await B1('DELETE', '/api/recordings/' + rec.id)).status, 404);
  /* not audio → refused */
  r = await A1('POST', '/api/recordings?verse=col-1-15&week=2026-10-19', Buffer.from('<html>hello</html>'.repeat(30)), 'audio/webm');
  assert.equal(r.status, 400);
  r = await A1('POST', '/api/recordings?verse=col-1-15&week=2026-10-19', webm, 'text/html');
  assert.equal(r.status, 400);
  /* without the app's header (another website) → refused */
  r = await fetch(base + '/api/recordings?verse=col-1-15&week=2026-10-19', { method: 'POST', headers: { 'content-type': 'audio/webm' }, body: webm });
  assert.equal(r.status, 403);
  /* only the newest 5 per verse are kept */
  for (let i = 0; i < 6; i++) await A1('POST', '/api/recordings?verse=col-1-15&week=2026-10-19', webm, 'audio/webm');
  const list = (await (await A1('GET', '/api/recordings')).json()).recordings;
  assert.equal(list.length, 5);
  assert.ok(!list.find(x => x.id === rec.id), 'the oldest was removed');
  r = await A1('DELETE', '/api/recordings/' + list[0].id);
  assert.equal(r.status, 200);
  assert.equal((await (await A1('GET', '/api/recordings')).json()).recordings.length, 4);
  /* memory stars sync like other progress (add-only) */
  const j = await (await A1('POST', '/api/progress/patch', JSON.stringify({ ops: [{ p: 'memory.2026-10-19-fri', v: true, t: Date.now() }] }), 'application/json')).json();
  assert.equal(j.state.memory['2026-10-19-fri'], true);
});
