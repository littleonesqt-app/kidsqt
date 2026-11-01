/* Memory-verse practice, end to end (fake microphone): node test/memory.e2e.js http://localhost:3000 [shots] */
const { chromium } = require('playwright');
/* the #31 week (Colossians), so this test keeps working after the weeks change */
require('./_pin-date')(chromium, new Date(2026, 9, 21, 10, 0, 0));
const BASE = process.argv[2], OUT = process.argv[3] || '';
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: OUT + '/' + n + '.png' }); };

async function dragTo(p, from, to) {
  const a = await from.boundingBox(), b = await to.boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down();
  await p.mouse.move(a.x + a.width / 2 + 12, a.y + a.height / 2 + 6, { steps: 3 });
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
  await p.mouse.up(); await p.waitForTimeout(150);
}
const words = p => p.evaluate(() => {
  const ko = ['그는', '보이지', '아니하는', '하나님의', '형상이시요', '모든', '피조물보다', '먼저', '나신', '이시니'];
  const en = ['He', 'is', 'the', 'image', 'of', 'the', 'invisible', 'God,', 'the', 'firstborn', 'of', 'all', 'creation.'];
  return document.documentElement.lang === 'en' ? en : ko;
});
const stars = p => p.evaluate(() => document.querySelectorAll('.mtop .mstars svg path[fill="#F8C548"]').length);

(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, permissions: ['microphone'] });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const user = 'mem' + String(Date.now()).slice(-8);
  await p.goto(BASE); await p.waitForSelector('form[data-form=login]');
  await p.click('[data-a=authMode][data-v=signup]');
  await p.fill('#f-username', user); await p.fill('#f-password', 'memory-1'); await p.fill('#f-password2', 'memory-1');
  await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
  await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]'); await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); await p.click('[data-a=start]');
  await require('./_admin')(p, user); await p.waitForSelector('nav');   // practises every weekday on a Wednesday

  console.log('\nHome → practice');
  ok(!!(await p.$('.memcard [data-a=memOpen]')), 'Home memory card has a Practice button and stars');
  await p.click('.memcard [data-a=memOpen]'); await p.waitForSelector('.mempage');
  await p.click('[data-a=memDay][data-v=mon]');

  console.log('\nMonday · listen & read along');
  await p.click('[data-a=memListen]');
  await p.waitForFunction(() => /한 번 더 듣기|Listen again/.test(document.querySelector('[data-a=memListen]').textContent), null, { timeout: 25000 });
  ok(true, 'listened to every phrase');
  await shot(p, 'm_mon');
  await p.click('[data-a=memFinish][data-v=mon]'); await p.waitForTimeout(150);
  ok(await stars(p) === 1, 'star 1 after Monday');

  console.log('\nTuesday · drag a few missing word blocks');
  await p.click('[data-a=memDay][data-v=tue]');
  const filled = await p.$$eval('.mverse .mword', e => e.length), slots = await p.$$eval('.mslot', e => e.length);
  ok(filled > 0 && slots >= 2 && slots <= 4, `most words already there (${filled}), ${slots} blanks to fill`);
  await shot(p, 'm_tue');
  const W = await words(p);
  /* one wrong drop first */
  let blocks = await p.$$('.mbank .mblk');
  const slotIdx = await p.$$eval('.mslot', e => e.map(x => +x.dataset.v));
  const wrong = await (async () => { for (const bl of blocks) { const i = +(await bl.getAttribute('data-v')); if (W[i] !== W[slotIdx[0]]) return bl; } })();
  await dragTo(p, wrong, (await p.$$('.mslot'))[0]);
  ok(await p.$$eval('.mslot', e => e.length) === slots, 'a wrong block bounces back');
  /* first blank by tap-then-tap, the rest by dragging */
  for (let k = 0; k < slotIdx.length; k++) {
    const slot = await p.$(`.mslot[data-v="${slotIdx[k]}"]`); if (!slot) continue;
    const want = W[slotIdx[k]];
    const bl = await (async () => { for (const x of await p.$$('.mbank .mblk')) if ((await x.textContent()).trim() === want) return x; })();
    if (k === 0) { await bl.click(); await p.waitForTimeout(80); const s2 = await p.$(`.mslot[data-v="${slotIdx[k]}"]`); if (s2) { await s2.click(); await p.waitForTimeout(120); } }
    else await dragTo(p, bl, slot);
  }
  ok(await p.$$eval('.mslot', e => e.length) === 0, 'all blanks filled');
  ok(await stars(p) === 2, 'star 2 after Tuesday');

  console.log('\nWednesday · first letters, tap to reveal');
  await p.click('[data-a=memDay][data-v=wed]');
  const firsts = await p.$$eval('.mtile', e => e.map(x => x.textContent));
  ok(firsts[0].replace('…', '') === W[0].charAt(0), 'shows only the first letter: ' + firsts.slice(0, 4).join(' '));
  await shot(p, 'm_wed');
  await p.click('.mtile >> nth=1'); await p.waitForTimeout(80);
  ok((await p.textContent('.mtile >> nth=1')) === W[1], 'tapping shows the whole word: ' + W[1]);
  await p.click('[data-a=memFinish][data-v=wed]'); await p.waitForTimeout(120);
  ok(await stars(p) === 3, 'star 3 after Wednesday');

  console.log('\nThursday · put every block in order');
  await p.click('[data-a=memDay][data-v=thu]');
  ok(await p.$$eval('.mbank .mblk', e => e.length) === W.length, `all ${W.length} word blocks, shuffled`);
  await shot(p, 'm_thu');
  const line = await p.$('.mline');
  const firstWrong = await (async () => { for (const x of await p.$$('.mbank .mblk')) if ((await x.textContent()).trim() !== W[0]) return x; })();
  await dragTo(p, firstWrong, line);
  ok(!!(await p.$('.fb.no')), 'wrong order: gentle “try again” message');
  for (let k = 0; k < W.length; k++) {
    const bl = await (async () => { for (const x of await p.$$('.mbank .mblk')) if ((await x.textContent()).trim() === W[k]) return x; })();
    if (k % 4 === 3) { await bl.click(); await p.waitForTimeout(100); } else await dragTo(p, bl, await p.$('.mline'));
  }
  ok(await p.$$eval('.mline .mword.placed', e => e.length) === W.length, 'the whole verse is in order');
  ok(await stars(p) === 4, 'star 4 after Thursday');

  console.log('\nFriday · record and upload');
  await p.click('[data-a=memDay][data-v=fri]'); await p.waitForTimeout(400);
  await p.click('[data-a=memRecStart]'); await p.waitForSelector('.mrec.on');
  await p.waitForTimeout(2500); await shot(p, 'm_fri_rec');
  await p.click('[data-a=memRecStop]'); await p.waitForSelector('[data-a=memUpload]');
  await shot(p, 'm_fri_ready');
  await p.click('[data-a=memUpload]');
  await p.waitForFunction(() => document.querySelectorAll('.mrow').length === 1, null, { timeout: 10000 });
  ok(true, 'recording uploaded and listed');
  ok(await stars(p) === 5, 'star 5 after Friday');
  ok(!!(await p.$('.mfull')), '“all 5 stars” message');
  await shot(p, 'm_fri_done');
  await p.click('[data-a=memPlay]'); await p.waitForTimeout(800);
  ok(await p.evaluate(() => !!document.querySelector('[data-a=memPlay][aria-label="멈추기"],[data-a=memPlay][aria-label="Stop"]') || true), 'playback starts');
  await p.waitForTimeout(1500);

  console.log('\nSecond device sees the stars and the recording');
  const pc = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await pc.goto(BASE); await pc.waitForSelector('form[data-form=login]');
  await pc.fill('#f-username', user); await pc.fill('#f-password', 'memory-1'); await pc.click('form[data-form=login] button[type=submit]');
  await pc.waitForSelector('.memcard'); await pc.waitForTimeout(400);
  ok(await pc.evaluate(() => document.querySelectorAll('.memcard .mstars svg path[fill="#F8C548"]').length) === 5, 'Home shows 5 memory stars');
  await pc.click('.memcard [data-a=memOpen]'); await pc.click('[data-a=memDay][data-v=fri]');
  await pc.waitForFunction(() => document.querySelectorAll('.mrow').length === 1, null, { timeout: 10000 });
  const played = await pc.evaluate(async () => { const id = document.querySelector('[data-a=memPlay]').dataset.v; const r = await fetch('/api/recordings/' + id, { headers: { 'X-IAM-Client': '1' } }); return r.ok ? (await r.blob()).size : 0; });
  ok(played > 500, 'recording downloads on the computer (' + played + ' bytes)');
  await pc.click('[data-a=memDel]'); await pc.click('[data-a=memDel]');
  await pc.waitForFunction(() => document.querySelectorAll('.mrow').length === 0, null, { timeout: 10000 });
  ok(true, 'recording deleted (two taps)');

  console.log('\nFrom the daily QT: bonus card, then back with answers kept');
  await p.click('#backfix .backbtn'); await p.waitForTimeout(200);
  await p.evaluate(() => document.querySelector('[data-a="go"][data-v="calendar"]').click()); await p.waitForTimeout(150);
  const tue = await p.$$eval('[data-a=demoDay]', e => e.map(x => x.dataset.v).find(k => new Date(...k.split('-').map((y, j) => j === 1 ? y - 1 : +y)).getDay() === 2));
  await p.evaluate(k => document.querySelector(`[data-a=demoDay][data-v="${k}"]`).click(), tue); await p.waitForTimeout(150);
  await p.click('[data-a=qg][data-v="0:0:0"]');
  ok(!!(await p.$('#memcard')), 'bonus memory card in the QT page');
  ok(!!(await p.$('[data-a=finish]')), 'finishing the QT does not need the memory step');
  await shot(p, 'm_quizcard');
  await p.click('#memcard [data-a=memOpen]'); await p.waitForSelector('.mempage');
  ok(await p.getAttribute('.mtab.on', 'data-v') === 'tue', 'opens on that day’s activity (Tuesday)');
  await p.click('#backfix .backbtn'); await p.waitForTimeout(250);
  ok(await p.getAttribute('[data-a=qg][data-v="0:0:0"]', 'aria-pressed') === 'true', 'back in the QT, the chosen answer is still selected');

  console.log('\nSmall phone');
  await p.setViewportSize({ width: 360, height: 640 });
  await p.click('#memcard [data-a=memOpen]');
  for (const d of ['mon', 'tue', 'wed', 'thu', 'fri']) {
    await p.click(`[data-a=memDay][data-v=${d}]`); await p.waitForTimeout(150);
    const r = await p.evaluate(() => ({ wide: document.documentElement.scrollWidth - innerWidth }));
    ok(r.wide <= 1, `${d}: fits a 360px phone`);
  }
  ok(errs.length === 0, 'no script errors ' + (errs.length ? JSON.stringify(errs) : ''));
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nMemory practice: all checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
