/* End-to-end account test with real browsers (Playwright). Each browser context = a separate device.
   Run against a fresh server:  node test/accounts.e2e.js http://localhost:3000 [screenshot-dir] */
const { chromium } = require('playwright');
/* the #31 week (Colossians), so this test keeps working after the weeks change */
require('./_pin-date')(chromium, new Date(2026, 9, 23, 10, 0, 0));   // Friday: the whole week can be done and recorded
const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = process.argv[3] || '';
let failures = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) failures++; };
const step = s => console.log('\n' + s);

async function device(b, name, viewport) {
  const ctx = await b.newContext({ viewport: viewport || { width: 390, height: 844 } });
  const p = await ctx.newPage();
  p.errs = [];
  p.on('pageerror', e => p.errs.push(name + ': ' + e.message));
  p.ctx = ctx;
  return p;
}
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: OUT + '/' + n + '.png' }); };
const click = async (p, sel) => { await p.click(sel); await p.waitForTimeout(80); };
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(120); };
const text = p => p.evaluate(() => document.querySelector('main').innerText);
const server = p => p.evaluate(() => fetch('/api/progress', { headers: { 'X-IAM-Client': '1' } }).then(r => r.json()));
async function synced(p) {   // wait until this device has nothing left to send
  for (let i = 0; i < 60; i++) {
    const s = await p.evaluate(() => { const c = document.getElementById('syncchip'); return c ? c.textContent : null; });
    const st = await server(p);
    if (s === null || /저장됨|Saved/.test(s)) { await p.waitForTimeout(150); return st; }
    await p.waitForTimeout(250);
  }
  return server(p);
}
async function settle(p) { await p.waitForTimeout(1300); }   // capture debounce + flush delay
async function signup(p, u, pw) {
  await p.goto(BASE); await p.waitForSelector('form[data-form=login]');
  await click(p, '[data-a=authMode][data-v=signup]');
  await p.fill('#f-username', u); await p.fill('#f-password', pw); await p.fill('#f-password2', pw);
  await click(p, 'form[data-form=signup] button[type=submit]');
  await p.waitForSelector('.rcode');
  const code = await p.textContent('.rcode');
  await click(p, '[data-a=rcAck]'); await click(p, '[data-a=rcDone]');
  await require('./_admin')(p, u);   // the test opens other weekdays from the calendar's admin panel
  return code;
}
async function login(p, u, pw) {
  await p.goto(BASE); await p.waitForSelector('form[data-form=login]');
  await p.fill('#f-username', u); await p.fill('#f-password', pw);
  await click(p, 'form[data-form=login] button[type=submit]');
  await p.waitForFunction(() => !document.querySelector('form[data-form=login] button[disabled]'), null, { timeout: 15000 });
  await p.waitForTimeout(400);
}
const ANSWER = {
  1: async p => { await click(p, '[data-a=qm][data-v="0:0"]'); await click(p, '[data-a=qs][data-v="1:3"]'); await p.fill('[data-qt="2"]', '예수님은 어떤 분일까?'); },
  2: async p => { await click(p, '[data-a=qg][data-v="0:0:0"]'); await click(p, '[data-a=qg][data-v="0:1:1"]'); await click(p, '[data-v="1:0:X"]'); await click(p, '[data-v="1:1:O"]'); await click(p, '[data-v="1:2:O"]'); await click(p, '[data-a=qw][data-v="2:0"]'); await click(p, '[data-a=qw][data-v="2:1"]'); await p.fill('[data-qt="3"]', '십자가의 피로'); },
  3: async p => { await click(p, '[data-a=qs][data-v="0:1"]'); await click(p, '[data-a=qw][data-v="1:0"]'); for (const [l, r] of [[0, 2], [1, 1], [2, 0]]) { await click(p, `[data-a=ql][data-v="2:${l}"]`); await click(p, `[data-a=qr][data-v="2:${r}"]`); } await p.fill('[data-qt="3"]', '흔들리지 않는 믿음'); },
  4: async p => { await click(p, '[data-a=qs][data-v="0:1"]'); await click(p, '[data-a=qw][data-v="1:0"]'); await click(p, '[data-a=qs][data-v="2:0"]'); await p.fill('[data-qf="3:0"]', '구원해'); },
  5: async p => { await click(p, '[data-a=qm][data-v="0:0"]'); await click(p, '[data-a=qm][data-v="0:1"]'); await click(p, '[data-a=qm][data-v="0:2"]'); await click(p, '[data-a=qs][data-v="1:1"]'); await click(p, '[data-a=qx][data-v^="2:"]'); await p.fill('[data-qf="3:0"]', '사랑이신'); await p.fill('[data-qf="3:1"]', '친절하게'); }
};
async function doQT(p, key) {
  await p.evaluate(() => document.querySelector('nav [data-v="home"]').click()); await p.waitForTimeout(80);
  await p.evaluate(() => document.querySelector('[data-a="go"][data-v="calendar"]').click()); await p.waitForTimeout(120);
  await p.evaluate(k => document.querySelector(`[data-a=demoDay][data-v="${k}"]`).click(), key); await p.waitForTimeout(150);
  const wd = new Date(...key.split('-').map((x, j) => j === 1 ? x - 1 : +x)).getDay();
  await ANSWER[wd](p);
  await p.waitForTimeout(150);
  if (!(await p.$('.overlay'))) { await click(p, '[data-a=finish]'); if (await p.$('[data-a=finish][data-v=force]')) await click(p, '[data-a=finish][data-v=force]'); }
  await p.waitForSelector('.overlay .dialog');
  await click(p, '[data-a=celCal]');
  await p.waitForTimeout(250);
}

(async () => {
  const b = await chromium.launch();
  const ipad = await device(b, 'iPad', { width: 820, height: 1180 });

  step('1. New account with only a username and password (iPad)');
  const code = await signup(ipad, 'happykid123', 'sunny-day');
  ok(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code), 'recovery code shown once: ' + code);
  ok(/어떤 언어로 볼까요/.test(await text(ipad)), 'new account goes to the existing onboarding');
  await click(ipad, '[data-a=obNext]'); await click(ipad, '[data-a=gender][data-v=girl]'); await click(ipad, '[data-a=pickAv][data-v="3"]'); await click(ipad, '[data-a=start]');
  ok(/좋은|즐거운|편안한/.test(await text(ipad)), 'lands on Home');

  step('2. Monday QT on the iPad, saved to the account');
  await ipad.evaluate(() => document.querySelector('[data-a="go"][data-v="calendar"]').click()); await ipad.waitForTimeout(120);
  const keys = await ipad.$$eval('[data-a=demoDay]', e => e.map(x => x.dataset.v));
  const mon = keys.find(k => new Date(...k.split('-').map((x, j) => j === 1 ? x - 1 : +x)).getDay() === 1);
  await doQT(ipad, mon);
  await shot(ipad, 'e2e_ipad_calendar');
  let st = await synced(ipad);
  ok(st.state.days[mon] === true, 'server has Monday done (' + mon + ')');
  ok(st.state.answers[mon + '-2'] === '예수님은 어떤 분일까?', 'server has the typed QT answer');

  step('3. Thank-you notes (typed + handwriting) and stickers');
  await navTo(ipad, 'thanks');
  const wk = mon;
  await ipad.fill(`[data-note="${wk}-mon"]`, '친구가 도와줘서 감사해요');
  await ipad.click('h1'); await ipad.waitForTimeout(300);
  await click(ipad, `[data-a="thMode"][data-v="${wk}-tue|hand"]`);
  await ipad.waitForSelector('.ink-page canvas');
  const box = await (await ipad.$('.ink-page canvas')).boundingBox();
  await ipad.mouse.move(box.x + 60, box.y + 120); await ipad.mouse.down();
  for (let i = 1; i <= 12; i++) await ipad.mouse.move(box.x + 60 + i * 18, box.y + 120 + Math.sin(i) * 25);
  await ipad.mouse.up();
  await click(ipad, '[data-ik=save]'); await ipad.waitForTimeout(300);
  await settle(ipad);
  st = await synced(ipad);
  ok(st.state.notes[wk + '-mon'] === '친구가 도와줘서 감사해요', 'server has the typed note');
  ok(Array.isArray(st.state.ink[wk + '-tue']) && st.state.ink[wk + '-tue'].length === 1 && st.state.ink[wk + '-tue'][0].p.length > 20, 'server has the actual handwriting strokes');
  ok(Object.keys(st.state.stickers).length === 2, 'two stickers earned (typed + handwritten)');

  step('4. Finish the week, claim the Friday gift, dress the avatar, switch to English');
  for (const k of keys.filter(k => k !== mon)) await doQT(ipad, k);
  await ipad.evaluate(() => document.querySelector('nav [data-v="home"]').click()); await ipad.waitForTimeout(80);
  await ipad.evaluate(() => document.querySelector('[data-a="go"][data-v="calendar"]').click()); await ipad.waitForTimeout(120);
  await click(ipad, '[data-a=gift] >> nth=0'); await ipad.waitForTimeout(300);
  await click(ipad, '[data-a=giftSel][data-v=star]'); await click(ipad, '[data-a=giftConfirm]'); await ipad.waitForTimeout(200);
  await click(ipad, '[data-a=pickItem][data-v=star]'); await click(ipad, '[data-a=wearItem]');
  await click(ipad, '[data-a=setCat][data-v=hair]'); await click(ipad, '[data-a=pickItem][data-v=h_default]');
  await ipad.evaluate(() => scrollTo(0, 0)); await click(ipad, '.langtog [data-v=en]');
  await settle(ipad);
  st = await synced(ipad);
  ok(Object.keys(st.state.days).length === 5, 'server has all 5 days');
  ok(Object.keys(st.state.claimed).length === 1 && st.state.unlocked.includes('star') && !st.state.unlocked.includes('heart') && st.state.unlocked.length === 2, 'gift claimed once: only the ONE chosen shirt is unlocked');
  ok(st.state.equipped === 'star' && st.state.outfit.shirt === 'star', 'avatar outfit saved');
  ok(st.state.lang === 'en' && st.state.gender === 'girl' && st.state.avatar === 3, 'language and profile picture saved');
  await shot(ipad, 'e2e_ipad_profile');

  step('5. Same account on a computer');
  const pc = await device(b, 'PC', { width: 1280, height: 900 });
  await login(pc, 'happykid123', 'sunny-day');
  const home = await text(pc);
  ok(/Good (Morning|Afternoon|Evening)/.test(home), 'opens in English (saved language)');
  ok(/5 \/ 5 done/.test(home), 'Home shows the week as done');
  await pc.evaluate(() => document.querySelector('[data-a="go"][data-v="calendar"]').click()); await pc.waitForTimeout(150);
  const smiles = await pc.$$eval('.cday .c.done', e => e.length);
  ok(smiles >= 5, 'calendar shows the smiley faces (' + smiles + ')');
  await shot(pc, 'e2e_pc_calendar');
  await navTo(pc, 'thanks');
  ok(await pc.inputValue(`[data-note="${wk}-mon"]`) === '친구가 도와줘서 감사해요', 'typed thank-you note is there');
  ok(!!(await pc.$(`[data-a=inkOpen][data-v="${wk}-tue"] svg path`)), 'handwritten note is drawn from the saved strokes');
  await navTo(pc, 'profile');
  const prof = await text(pc);
  ok(/Lavender Star/.test(prof), 'avatar wears the Lavender Star shirt');
  ok(/collected 2 stickers/.test(prof), 'sticker collection: 2');
  ok(/happykid123/.test(prof), 'account section shows the username');
  await shot(pc, 'e2e_pc_profile');
  await pc.evaluate(k => { document.querySelector('nav [data-v="home"]').click(); }, mon);
  await pc.waitForTimeout(100);
  await pc.evaluate(k => document.querySelector(`[data-a=lesson][data-v="${k}"]`).click(), mon); await pc.waitForTimeout(200);
  ok(await pc.inputValue('[data-qt="2"]') === '예수님은 어떤 분일까?', 'saved QT answer is back in the Monday lesson');

  step('6. A change on the computer shows up on the iPad');
  await navTo(pc, 'thanks');
  await pc.fill(`[data-note="${wk}-wed"]`, 'Thank you for my family');
  await pc.click('h1'); await settle(pc); await synced(pc);
  await ipad.evaluate(() => document.querySelector('nav [data-v="thanks"]').click()); await ipad.waitForTimeout(100);
  await ipad.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await ipad.waitForTimeout(1200);
  ok(await ipad.inputValue(`[data-note="${wk}-wed"]`) === 'Thank you for my family', 'iPad picked up the new note');

  step('7. Refreshing keeps the child signed in');
  await pc.reload(); await pc.waitForTimeout(800);
  ok(!(await pc.$('form[data-form=login]')) && /Good/.test(await text(pc)), 'reload goes straight to Home');

  step('8. Offline on the computer, then back online');
  await pc.evaluate(() => document.querySelector('nav [data-v="thanks"]').click()); await pc.waitForTimeout(100);
  await pc.ctx.setOffline(true);
  await pc.fill(`[data-note="${wk}-thu"]`, 'Written with no internet');
  await pc.click('h1'); await pc.waitForTimeout(3500);
  await pc.evaluate(() => document.querySelector('nav [data-v="profile"]').click()); await pc.waitForTimeout(200);
  ok(/Offline/.test(await pc.textContent('#syncchip')), 'profile shows "Offline · will save when connected"');
  await pc.ctx.setOffline(false);
  await pc.evaluate(() => window.dispatchEvent(new Event('online')));
  st = await synced(pc);
  ok(st.state.notes[wk + '-thu'] === 'Written with no internet', 'the offline note reached the server');
  ok(Object.keys(st.state.stickers).length === 4, 'stickers counted once each, no duplicates (4)');

  step('9. Log out and back in');
  await ipad.evaluate(() => document.querySelector('nav [data-v="profile"]').click()); await ipad.waitForTimeout(150);
  await click(ipad, '[data-a=logout]'); await ipad.waitForSelector('form[data-form=login]');
  const left = await ipad.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('iamkids.u.')).length);
  ok(left === 0, 'local copy removed on logout (shared iPad safe)');
  await ipad.reload(); await ipad.waitForSelector('form[data-form=login]');
  ok(true, 'after logout + reload the login screen shows');
  await login(ipad, 'happykid123', 'sunny-day');
  await ipad.evaluate(() => document.querySelector('nav [data-v="profile"]').click()); await ipad.waitForTimeout(200);
  ok(/collected 4 stickers/.test(await text(ipad)), 'everything is back after logging in again');

  step('10. A different account sees nothing from the first one');
  const other = await device(b, 'Other');
  await signup(other, 'kid_two', 'rainbow-7');
  await click(other, '[data-a=obNext]'); await click(other, '[data-a=start]');
  const o = await server(other);
  ok(Object.keys(o.state.days).length === 0 && Object.keys(o.state.notes).length === 0 && Object.keys(o.state.stickers).length === 0, 'kid_two starts empty');
  await other.evaluate(() => document.querySelector('nav [data-v="thanks"]').click()); await other.waitForTimeout(100);
  ok(await other.inputValue(`[data-note="${wk}-mon"]`) === '', 'kid_two cannot see happykid123’s note');

  step('11. Progress saved on a device before accounts existed');
  const old = await device(b, 'OldTablet');
  await old.addInitScript(([wk]) => {
    if (localStorage.getItem('seeded')) return; localStorage.setItem('seeded', '1');
    localStorage.setItem('iamkids.app.v2', JSON.stringify({ onboarded: true, lang: 'ko', gender: 'boy', avatar: 2, days: { '2026-10-12': true, '2026-10-13': true },
      notes: { [wk + '-mon']: 'old device note', '2026-10-12-mon': 'last week note' }, unlocked: ['starter', 'heart'], equipped: 'heart', claimed: {}, answers: {}, ink: {}, noteMode: {}, outfit: {} }));
  }, [wk]);
  await login(old, 'happykid123', 'sunny-day');
  ok(/이 기기에 저장된 기록이 있어요|This device has saved progress/.test(await text(old)), 'offers to move the old progress');
  ok(/Stickers\s*2|스티커\s*2/.test(await text(old)), 'summary counts the old stickers');
  await shot(old, 'e2e_migrate');
  await click(old, '[data-a=migYes]'); await old.waitForTimeout(800);
  st = await server(old);
  ok(st.state.days['2026-10-12'] && st.state.days['2026-10-13'], 'old QT days added');
  ok(st.state.notes['2026-10-12-mon'] === 'last week note', 'old note added');
  ok(st.state.notes[wk + '-mon'] === '친구가 도와줘서 감사해요', 'newer cloud note NOT overwritten by the old one');
  ok(st.state.equipped === 'star' && st.state.unlocked.includes('heart'), 'cloud outfit kept, old unlocked item added');
  ok(st.state.stickers['2026-10-12-mon'] && st.state.stickers['2026-10-12-mon'].kind === 'mon', 'stickers for old notes come along');
  ok(await old.evaluate(() => localStorage.getItem('iamkids.app.v2') === null), 'not offered again');

  step('12. Too many wrong passwords');
  const bad = await device(b, 'Guesser');
  await bad.goto(BASE); await bad.waitForSelector('form[data-form=login]');
  for (let i = 0; i < 6; i++) {
    await bad.fill('#f-username', 'kid_two'); await bad.fill('#f-password', 'wrong-' + i);
    await click(bad, 'form[data-form=login] button[type=submit]');
    await bad.waitForSelector('.ferr'); await bad.waitForTimeout(100);
  }
  const msg = await bad.textContent('.ferr');
  ok(/여러 번 틀렸어요|Too many tries/.test(msg), 'friendly lockout message: ' + msg.trim());
  await shot(bad, 'e2e_lockout');

  step('13. Forgot password → recovery code');
  const rec = await device(b, 'Recover');
  await rec.goto(BASE); await rec.waitForSelector('form[data-form=login]');
  await click(rec, '[data-a=authMode][data-v=recover]');
  await rec.fill('#f-username', 'happykid123'); await rec.fill('#f-code', code.toLowerCase());
  await rec.fill('#f-password', 'new-sunny-2'); await rec.fill('#f-password2', 'new-sunny-2');
  await shot(rec, 'e2e_recover');
  await click(rec, 'form[data-form=recover] button[type=submit]');
  await rec.waitForSelector('.rcode');
  const code2 = await rec.textContent('.rcode');
  ok(code2 !== code, 'a new recovery code replaces the used one');
  await click(rec, '[data-a=rcAck]'); await click(rec, '[data-a=rcDone]'); await rec.waitForTimeout(300);
  ok(/Good/.test(await text(rec)), 'signed in with the new password');

  step('14. Other devices are signed out after the password reset');
  await pc.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await pc.waitForTimeout(1200);
  ok(!!(await pc.$('form[data-form=login]')), 'computer shows the login screen');
  ok(/Please log in again|다시 로그인/.test(await pc.textContent('main')), 'with “please log in again”');

  step('15. Change password from Profile');
  await rec.evaluate(() => document.querySelector('nav [data-v="profile"]').click()); await rec.waitForTimeout(150);
  await click(rec, '[data-a=acct][data-v=pw]');
  await rec.fill('#f-current', 'new-sunny-2'); await rec.fill('#f-password', 'third-sunny'); await rec.fill('#f-password2', 'third-sunny');
  await click(rec, 'form[data-form=pw] button[type=submit]'); await rec.waitForTimeout(800);
  ok(/Password changed/.test(await rec.evaluate(() => document.getElementById('layer').innerText)), 'toast: password changed');
  await login(pc, 'happykid123', 'third-sunny');
  ok(/Good/.test(await text(pc)), 'computer logs in with the newest password');

  const all = [ipad, pc, other, old, bad, rec].flatMap(p => p.errs);
  ok(all.length === 0, 'no script errors' + (all.length ? ': ' + all.join(' | ') : ''));
  await b.close();
  console.log('\n' + (failures ? failures + ' check(s) FAILED' : 'All checks passed'));
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
