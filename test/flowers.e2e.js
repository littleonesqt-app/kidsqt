/* Thank-you flowers, end to end: node test/flowers.e2e.js http://localhost:3000 [shots] */
const { chromium } = require('playwright');
/* the #31 week (Colossians), so this test keeps working after the weeks change */
require('./_pin-date')(chromium, new Date(2026, 9, 21, 10, 0, 0));
const BASE = process.argv[2], OUT = process.argv[3] || '';
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: OUT + '/' + n + '.png' }); };
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(150); };
const pots = p => p.evaluate(() => [...document.querySelectorAll('.fpwrap')].map(w => ({ id: w.id, bloom: !!w.querySelector('.fp-head'), grow: !!w.querySelector('.fpot.grow') })));
const stickers = p => p.evaluate(() => fetch('/api/progress', { headers: { 'X-IAM-Client': '1' } }).then(r => r.json()).then(j => Object.keys((j.state || {}).stickers || {})));

async function draw(p) {
  const c = await p.$('.ink canvas'), b = await c.boundingBox();
  await p.mouse.move(b.x + 60, b.y + 80); await p.mouse.down();
  for (let i = 1; i <= 12; i++) await p.mouse.move(b.x + 60 + i * 14, b.y + 80 + (i % 2) * 18);
  await p.mouse.up();
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const user = 'flw' + String(Date.now()).slice(-8);
  await p.goto(BASE); await p.waitForSelector('form[data-form=login]');
  await p.click('[data-a=authMode][data-v=signup]');
  await p.fill('#f-username', user); await p.fill('#f-password', 'flowers-1'); await p.fill('#f-password2', 'flowers-1');
  await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
  await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]'); await p.click('[data-a=obNext]'); await p.click('[data-a=start]');
  await require('./_admin')(p, user); await p.waitForSelector('nav');   // writes all five notes on a Wednesday
  await navTo(p, 'thanks');

  console.log('\nBefore any note');
  let P = await pots(p);
  ok(P.length === 5 && P.every(x => !x.bloom), 'five pots, all sprouts');
  await shot(p, 'f_sprouts');

  console.log('\nTyped note (Monday)');
  const mon = P[0].id.slice(3);
  ok(await p.$eval(`[data-v="${mon}"].ndone`, e => e.hidden), 'no done button before writing');
  await p.fill(`[data-note="${mon}"]`, '오늘 친구랑 화해해서 감사해요');
  ok(!(await p.$eval(`[data-v="${mon}"].ndone`, e => e.hidden)), 'done button appears after writing');
  await p.click(`[data-v="${mon}"].ndone`); await p.waitForTimeout(200);
  P = await pots(p);
  ok(P[0].grow && P[0].bloom, 'Monday flower is growing');
  ok(P.slice(1).every(x => !x.bloom), 'other days stay sprouts');
  ok(!!(await p.$(`#stk-${mon} svg`)), 'Monday sticker still awarded');
  await p.waitForTimeout(1500); await shot(p, 'f_mid'); await p.waitForTimeout(1500); await shot(p, 'f_mon_done');
  ok(await p.$eval(`[data-v="${mon}"].ndone`, e => e.hidden), 'done button hides after completion');

  console.log('\nSwitching modes and opening notes does not trigger anything');
  const tue = P[1].id.slice(3);
  await p.click(`[data-a=thMode][data-v="${tue}|hand"]`); await p.waitForSelector('.ink');
  await p.click('[data-ik=close]'); await p.waitForTimeout(200);
  P = await pots(p);
  ok(!P[1].bloom && !P.some(x => x.grow), 'opening the notebook without writing: still a sprout');

  console.log('\nHandwritten note (Tuesday)');
  await p.click(`[data-a=inkOpen][data-v="${tue}"]`); await p.waitForSelector('.ink');
  await draw(p); await p.click('[data-ik=save]'); await p.waitForTimeout(250);
  P = await pots(p);
  ok(P[1].grow && P[1].bloom, 'Tuesday flower grows after saving handwriting');
  ok(P[0].bloom && !P[0].grow, 'Monday stays bloomed without replaying');
  await p.waitForTimeout(2600);

  console.log('\nEditing a completed note');
  await p.click(`[data-a=thMode][data-v="${mon}|type"]`); await p.waitForTimeout(100);
  await p.fill(`[data-note="${mon}"]`, '오늘 친구랑 화해하고 같이 놀아서 감사해요');
  await p.locator(`[data-note="${mon}"]`).blur(); await p.waitForTimeout(200);
  P = await pots(p);
  ok(P[0].bloom && !P[0].grow, 'editing again keeps the flower, no replay');
  await p.waitForTimeout(1800); const st1 = await stickers(p);
  ok(st1.length === 2, 'exactly two stickers saved (no duplicates): ' + st1.length);

  console.log('\nReload and another device');
  await p.waitForTimeout(1500);
  await p.reload(); await p.waitForSelector('nav'); await navTo(p, 'thanks');
  P = await pots(p);
  ok(P[0].bloom && P[1].bloom && !P.some(x => x.grow) && !P[2].bloom, 'after reload: Mon/Tue bloomed, no animation, rest sprouts');
  const pc = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await pc.goto(BASE); await pc.waitForSelector('form[data-form=login]');
  await pc.fill('#f-username', user); await pc.fill('#f-password', 'flowers-1'); await pc.click('form[data-form=login] button[type=submit]');
  await pc.waitForSelector('nav'); await navTo(pc, 'thanks');
  const PC = await pots(pc);
  ok(PC[0].bloom && PC[1].bloom && !PC[2].bloom, 'computer shows the same flowers');

  console.log('\nAll five');
  for (let i = 2; i < 5; i++) {
    const k = P[i].id.slice(3);
    await p.fill(`[data-note="${k}"]`, '하나님께 감사해요 ' + i);
    await p.click(`[data-v="${k}"].ndone`); await p.waitForTimeout(150);
  }
  await p.waitForTimeout(2500);
  ok(!!(await p.$('.fpfx')), 'all five bloomed: celebration plays');
  await shot(p, 'f_all');
  await p.waitForTimeout(3600);
  ok(!(await p.$('.fpfx')), 'celebration clears itself');
  P = await pots(p);
  ok(P.every(x => x.bloom), 'five flowers bloomed');

  console.log('\nEnglish and reduced motion');
  const rm = await (await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })).newPage();
  await rm.goto(BASE); await rm.waitForSelector('form[data-form=login]');
  const u2 = 'flr' + String(Date.now()).slice(-8);
  await rm.click('[data-a=authMode][data-v=signup]');
  await rm.fill('#f-username', u2); await rm.fill('#f-password', 'flowers-1'); await rm.fill('#f-password2', 'flowers-1');
  await rm.click('form[data-form=signup] button[type=submit]'); await rm.waitForSelector('.rcode');
  await rm.click('[data-a=rcAck]'); await rm.click('[data-a=rcDone]'); await rm.click('[data-a=lang][data-v=en]'); await rm.click('[data-a=obNext]'); await rm.click('[data-a=start]');
  await navTo(rm, 'thanks');
  const k0 = (await pots(rm))[0].id.slice(3);
  await rm.fill(`[data-note="${k0}"]`, 'Thank you God for my family');
  ok((await rm.textContent(`[data-v="${k0}"].ndone`)).includes('Done'), 'English done button');
  await rm.click(`[data-v="${k0}"].ndone`); await rm.waitForTimeout(100);
  const vis = await rm.evaluate(() => { const e = document.querySelector('.fpot.grow .fp-pet'), s = document.querySelector('.fpot.grow .fp-sprout'); return [getComputedStyle(e).opacity, getComputedStyle(e).transform, getComputedStyle(s).opacity]; });
  ok(vis[0] === '1' && (vis[1] === 'none' || vis[1] === 'matrix(1, 0, 0, 1, 0, 0)') && vis[2] === '0', 'reduced motion: full flower shown at once ' + JSON.stringify(vis));
  ok((await rm.textContent('.fpwrap text')) === 'Mon', 'pot label in English');
  await shot(rm, 'f_en');
  ok(errs.length === 0, 'no script errors ' + JSON.stringify(errs));
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nFlowers: all checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
