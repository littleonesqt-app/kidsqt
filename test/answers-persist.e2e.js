/* Every QT question type keeps its answer: solve each day (#31 and #32), leave, reload the page, come back — the answers must still be there.
   Also: a typed question (text / fill) can be answered by handwriting, and that answer is kept too.
   node test/answers-persist.e2e.js http://localhost:3000        (also works on the demo file: file:///…/devotion-app.html)
   The browser's calendar day is set to the Friday of each week, so every day of the week is open. */
const { chromium } = require('playwright');
const BASE = process.argv[2];
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const input = async (p, sel, v) => { await p.fill(sel, v); await p.evaluate(s => document.querySelector(s).dispatchEvent(new Event('input', { bubbles: true })), sel); };
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(200); };
const server = p => p.evaluate(() => fetch('/api/progress', { headers: { 'X-IAM-Client': '1' } }).then(r => r.ok ? r.json() : null).then(j => j && j.state).catch(() => null));
const isServer = /^https?:/.test(BASE || '');

// #31 (Colossians): Mon pickmany+pick+text · Tue single2+ox+blanks+text · Wed single+blanks+match+text · Thu single+blanks+single+fill · Fri multi+single+text+fill
const W31 = {
  '2026-10-19': async p => { await p.click('[data-a=qm][data-v="0:0"]'); await p.click('[data-a=qm][data-v="0:2"]'); await p.click('[data-a=qs][data-v="1:3"]'); await input(p, '#qt-2', '예수님은 어떻게 오셨어요?'); },
  '2026-10-20': async p => { await p.click('[data-a=qg][data-v="0:0:0"]'); await p.click('[data-a=qg][data-v="0:1:1"]');
    await p.click('[data-a=qox][data-v="1:0:X"]'); await p.click('[data-a=qox][data-v="1:1:O"]'); await p.click('[data-a=qox][data-v="1:2:O"]');
    await p.click('[data-a=qw][data-v="2:0"]'); await p.click('[data-a=qw][data-v="2:1"]'); await input(p, '#qt-3', '십자가의 피로'); },
  '2026-10-21': async p => { await p.click('[data-a=qs][data-v="0:1"]'); await p.click('[data-a=qw][data-v="1:0"]');
    for (const [l, r] of [[0, 2], [1, 1], [2, 0]]) { await p.click(`[data-a=ql][data-v="2:${l}"]`); await p.click(`[data-a=qr][data-v="2:${r}"]`); } await input(p, '#qt-3', '흔들리지 않는 믿음'); },
  '2026-10-22': async p => { await p.click('[data-a=qs][data-v="0:1"]'); await p.click('[data-a=qw][data-v="1:0"]'); await p.click('[data-a=qs][data-v="2:0"]'); await input(p, '[data-qf="3:0"]', '구원해'); },
  '2026-10-23': async p => { for (const j of [0, 1, 2]) await p.click(`[data-a=qm][data-v="0:${j}"]`); await p.click('[data-a=qs][data-v="1:1"]'); await input(p, '#qt-2', '먼저 인사하기'); await input(p, '[data-qf="3:0"]', '사랑이신'); await input(p, '[data-qf="3:1"]', '친절하게'); }
};
// #32 (Philemon)
const W32 = {
  '2026-10-26': async p => {
    await p.click('#qcard-0 .qdraw'); await p.waitForSelector('.ink');
    const b = await (await p.$('.ink canvas')).boundingBox();
    await p.mouse.move(b.x + 60, b.y + 90); await p.mouse.down(); for (let i = 1; i <= 12; i++) await p.mouse.move(b.x + 60 + i * 15, b.y + 90 + (i % 2) * 20); await p.mouse.up();
    await p.click('[data-ik=save]'); await p.waitForTimeout(200);
    await p.click('[data-a=qs][data-v="1:2"]'); await input(p, '#qt-2', '돌아와서 미안해요.'); await p.click('[data-a=qs][data-v="3:0"]'); },
  '2026-10-27': async p => { await p.click('[data-a=qs][data-v="0:1"]'); await p.click('[data-a=qg][data-v="1:0:0"]'); await p.click('[data-a=qg][data-v="1:1:1"]'); await p.click('[data-a=qs][data-v="2:1"]'); await input(p, '#qt-3', '그것을 내 앞으로 계산하라'); },
  '2026-10-28': async p => { await p.click('[data-a=qs][data-v="0:1"]'); await p.click('[data-a=qm][data-v="1:0"]'); await p.click('[data-a=qm][data-v="1:2"]'); await p.click('[data-a=qox][data-v="2:0:X"]'); await p.click('[data-a=qox][data-v="2:1:O"]'); await p.click('[data-a=qw][data-v="3:1"]'); },
  '2026-10-29': async p => { await p.click('[data-a=qw][data-v="0:0"]'); await p.click('[data-a=qs][data-v="1:1"]'); await p.click('[data-a=qw][data-v="2:0"]'); await p.click('[data-a=qw][data-v="2:1"]'); await input(p, '#qt-3', '서로 사랑하는 형제로 대해요'); },
  '2026-10-30': async p => { await p.click('[data-a=qm][data-v="0:1"]'); await p.click('[data-a=qm][data-v="0:2"]');
    for (const [l, r] of [[0, 1], [1, 2], [2, 0]]) { await p.click(`[data-a=ql][data-v="1:${l}"]`); await p.click(`[data-a=qr][data-v="1:${r}"]`); }
    await input(p, '[data-qf="2:0"]', '동생'); await input(p, '[data-qf="2:1"]', '먼저 안아 주기'); }
};

const checks = p => p.$$eval('section[id^=qcard-]', s => ({ total: s.length, done: s.filter(x => !x.querySelector('.donecheck').hidden).length }));
const openDay = async (p, k) => { await navTo(p, 'home'); await p.click(`.daycard[data-v="${k}"]`); await p.waitForSelector('#qcard-0'); await p.waitForTimeout(150); };
const draw = async (p, n) => {
  const b = await (await p.$('.ink canvas')).boundingBox();
  await p.mouse.move(b.x + 50, b.y + 120); await p.mouse.down(); for (let i = 1; i <= (n || 10); i++) await p.mouse.move(b.x + 50 + i * 16, b.y + 120 + (i % 3) * 18); await p.mouse.up();
};

async function newPage(b, when) {
  const ctx = await require('./_pin-date').context(await b.newContext({ viewport: { width: 390, height: 844 } }), when);
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto(BASE); await p.waitForTimeout(600);
  if (await p.$('form[data-form=login]')) {
    const u = 'ap' + String(Date.now()).slice(-8) + Math.floor(Math.random() * 9);
    await p.click('[data-a=authMode][data-v=signup]');
    await p.fill('#f-username', u); await p.fill('#f-password', 'answers-ok1'); await p.fill('#f-password2', 'answers-ok1');
    await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
    await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]');
  }
  if (await p.$('[data-a=obNext]')) { await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); }
  await p.waitForSelector('.daygrid');
  return p;
}
const reload = async p => { if (isServer) await p.evaluate(() => fetch('/api/progress', { headers: { 'X-IAM-Client': '1' } })); await p.waitForTimeout(1200); await p.reload(); await p.waitForSelector('.daygrid', { timeout: 15000 }); await p.waitForTimeout(300); };

async function week(b, name, when, W) {
  console.log('\n' + name + ': solve every day, leave, reload, come back');
  const p = await newPage(b, when);
  for (const [k, solve] of Object.entries(W)) {
    await openDay(p, k); await solve(p); await p.waitForTimeout(250);
    const a = await checks(p);
    ok(a.total > 0 && a.done === a.total, `${k}: all ${a.total} questions answered`);
    await openDay(p, k); // leave and come back
    const b2 = await checks(p);
    ok(b2.done === a.total, `${k}: still ${b2.done}/${a.total} after leaving the day`);
  }
  await reload(p);
  for (const k of Object.keys(W)) {
    await openDay(p, k);
    const c = await checks(p);
    ok(c.total > 0 && c.done === c.total, `${k}: after reloading the page, ${c.done}/${c.total} questions are still answered`);
  }
  if (isServer) {
    const st = await server(p);
    const keys = st ? Object.keys(st.answers || {}) : [];
    ok(keys.some(x => /^2026-10-(19-0|26-1)$/.test(x)), 'server has the Monday choice answer');
    const day = Object.keys(W)[1];
    ok(keys.filter(x => x.startsWith(day)).length >= 3, `server has several answers for ${day} (${keys.filter(x => x.startsWith(day)).length})`);
  }
  ok(p.errs.length === 0, 'no script errors ' + JSON.stringify(p.errs));
  await p.context().close();
}

async function handwriting(b) {
  console.log('\nTyped questions can be answered by handwriting (#31 Monday text, Thursday fill)');
  const p = await newPage(b, new Date(2026, 9, 23, 10, 0, 0));
  await openDay(p, '2026-10-19');
  await p.click('[data-a=qm][data-v="0:0"]'); await p.click('[data-a=qs][data-v="1:0"]');
  ok(!!(await p.$('#qcard-2 .hwbtn')), 'the typed question offers "손글씨로 쓰기"');
  ok((await checks(p)).done === 2, 'two answered, the typed one still open');
  await p.click('#qcard-2 .hwbtn'); await p.waitForSelector('.ink'); await draw(p, 12);
  await p.click('[data-ik=save]'); await p.waitForTimeout(300);
  ok(!!(await p.$('#qcard-2 .hwprev svg path')), 'handwriting preview appears in the question');
  ok((await checks(p)).done === 3, 'handwriting counts as the answer (3/3)');
  await p.click('#qcard-2 .hwprev'); await p.waitForSelector('.ink'); // reopen to edit, then close without changes
  await p.click('[data-ik=close]'); await p.waitForTimeout(250);
  ok((await checks(p)).done === 3, 'reopening and closing keeps it');
  await openDay(p, '2026-10-22'); // Thursday: fill question #4
  await p.click('[data-a=qs][data-v="0:1"]'); await p.click('[data-a=qw][data-v="1:0"]'); await p.click('[data-a=qs][data-v="2:0"]');
  ok(!!(await p.$('#qcard-3 .hwbtn')), 'the fill-in question offers handwriting too');
  await p.click('#qcard-3 .hwbtn'); await p.waitForSelector('.ink'); await draw(p, 8); await p.click('[data-ik=save]'); await p.waitForTimeout(300);
  ok((await checks(p)).done === 4, 'handwritten sentence completes the fill-in question');
  await reload(p);
  await openDay(p, '2026-10-19');
  const m = await checks(p);
  ok(m.done === 3 && !!(await p.$('#qcard-2 .hwprev svg path')), 'after reload: Monday still 3/3 with the handwriting');
  await openDay(p, '2026-10-22');
  ok((await checks(p)).done === 4, 'after reload: Thursday still 4/4');
  if (isServer) { const st = await server(p); ok(!!(st && st.qink && Object.keys(st.qink).some(x => /^2026-10-19-2$/.test(x))), 'server has the handwriting'); }
  ok(p.errs.length === 0, 'no script errors ' + JSON.stringify(p.errs));
  await p.context().close();
}

(async () => {
  const b = await chromium.launch();
  await week(b, '#31', new Date(2026, 9, 23, 10, 0, 0), W31);
  await week(b, '#32', new Date(2026, 9, 30, 10, 0, 0), W32);
  await handwriting(b);
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nAnswers kept: all checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
