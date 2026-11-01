/* Memory-verse stickers, end to end: node test/mem-stickers.e2e.js http://localhost:3000 [shots] */
const { chromium } = require('playwright');
/* the #31 week (Colossians), so this test keeps working after the weeks change */
require('./_pin-date')(chromium, new Date(2026, 9, 21, 10, 0, 0));
const BASE = process.argv[2], OUT = process.argv[3] || '';
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: OUT + '/' + n + '.png' }); };
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(200); };
const server = p => p.evaluate(() => fetch('/api/progress', { headers: { 'X-IAM-Client': '1' } }).then(r => r.json()).then(j => j.state));

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const user = 'ms' + String(Date.now()).slice(-8);
  await p.goto(BASE); await p.waitForSelector('form[data-form=login]');
  await p.click('[data-a=authMode][data-v=signup]');
  await p.fill('#f-username', user); await p.fill('#f-password', 'sticker-1'); await p.fill('#f-password2', 'sticker-1');
  await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
  await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]'); await p.click('[data-a=obNext]'); await p.click('[data-a=start]');
  await require('./_admin')(p, user); await p.waitForSelector('nav');   // uses later weekdays on a Wednesday

  console.log('\nOpening memory practice gives nothing');
  await p.click('.memcard [data-a=memOpen]'); await p.waitForSelector('.mempage');
  await p.click('[data-a=memDay][data-v=wed]'); await p.waitForTimeout(150);
  ok(!(await p.$('#stkgot')), 'no sticker just for opening the page');
  let st = await server(p);
  ok(!Object.keys(st.stickers || {}).length, 'no sticker saved yet');

  console.log('\nFinishing a day earns the memory sticker');
  await p.click('[data-a=memFinish][data-v=wed]'); await p.waitForTimeout(400);
  ok(!!(await p.$('#stkgot')), 'sticker celebration appears');
  ok((await p.textContent('#stkgot')).includes('말씀 암송을 완료했어요! 스티커를 받았어요!'), 'Korean message');
  ok(!!(await p.$('#stkgot svg circle[fill="#9B8AE3"]')), 'it is the memory sticker (lavender Bible badge)');
  await shot(p, 'ms_celebrate');
  await p.waitForTimeout(3300);
  ok(!(await p.$('#stkgot')), 'celebration goes away by itself');
  await p.waitForTimeout(800); st = await server(p);
  const mk = Object.keys(st.stickers).filter(k => k.startsWith('mem-'));
  ok(mk.length === 1 && st.stickers[mk[0]].kind === 'mem' && /-wed$/.test(mk[0]), 'saved to the account for that week and day: ' + mk[0]);

  console.log('\nNo double rewards');
  await p.click('[data-a=memFinish][data-v=wed]').catch(() => {}); await p.waitForTimeout(300);
  ok(!(await p.$('#stkgot')), 'finishing the same day again: no second sticker');
  await p.reload(); await p.waitForSelector('nav');
  await p.click('.memcard [data-a=memOpen]'); await p.waitForSelector('.mempage'); await p.click('[data-a=memDay][data-v=wed]'); await p.waitForTimeout(150);
  await p.click('[data-a=memFinish][data-v=wed]').catch(() => {}); await p.waitForTimeout(300);
  ok(!(await p.$('#stkgot')), 'after a refresh: still no second sticker');
  await p.click('[data-a=memDay][data-v=thu]'); await p.waitForTimeout(150);
  for (const w of ['그는', '보이지', '아니하는', '하나님의', '형상이시요', '모든', '피조물보다', '먼저', '나신', '이시니']) { const bl = await (async () => { for (const x of await p.$$('.mbank .mblk')) if ((await x.textContent()).trim() === w) return x; })(); await bl.click(); await p.waitForTimeout(60); }
  await p.waitForTimeout(300);
  ok(!!(await p.$('#stkgot')), 'a different day earns its own sticker');
  await p.waitForTimeout(3300);

  console.log('\nOne collection with both kinds');
  await p.click('#backfix .backbtn'); await p.waitForTimeout(200);
  await navTo(p, 'thanks');
  const note = await p.$eval('[data-note]', e => e.getAttribute('data-note'));
  await p.fill(`[data-note="${note}"]`, '하나님 감사해요 오늘도'); await p.click(`[data-v="${note}"].ndone`); await p.waitForTimeout(500);
  await navTo(p, 'profile');
  const prof = await p.textContent('main');
  ok(prof.includes('지금까지 모은 스티커 3개!') && prof.includes('감사 1 · 암송 2'), 'profile total counts both kinds (3 = 1 thanks + 2 memory)');
  await shot(p, 'ms_profile');
  await p.evaluate(() => document.querySelector('[data-a=go][data-v=stickers]').click()); await p.waitForTimeout(250);
  ok((await p.$$eval('.stkgrid .stkcell', e => e.length)) === 3, 'gallery shows all 3');
  ok((await p.textContent('.stktabs')).replace(/\s/g, '') === '전체3감사노트1말씀암송2', 'tabs: 전체 3 · 감사 노트 1 · 말씀 암송 2');
  await shot(p, 'ms_gallery');
  await p.click('[data-a=stkTab][data-v=mem]'); await p.waitForTimeout(150);
  ok((await p.$$eval('.stkgrid .stkcell', e => e.length)) === 2 && (await p.$$eval('.stklab.mem', e => e.length)) === 2, 'memory filter shows the 2 memory stickers');
  await p.click('[data-a=stkTab][data-v=thanks]'); await p.waitForTimeout(150);
  ok((await p.$$eval('.stkgrid .stkcell', e => e.length)) === 1, 'thank-you filter shows the 1 thank-you sticker');
  await shot(p, 'ms_gallery_thanks');

  console.log('\nOther device and English');
  await p.waitForTimeout(1500);
  const pc = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await pc.goto(BASE); await pc.waitForSelector('form[data-form=login]');
  await pc.fill('#f-username', user); await pc.fill('#f-password', 'sticker-1'); await pc.click('form[data-form=login] button[type=submit]');
  await pc.waitForSelector('nav'); await navTo(pc, 'profile');
  ok((await pc.textContent('main')).includes('감사 1 · 암송 2'), 'computer shows the same 3 stickers');
  await pc.click('[data-a=setLang][data-v=en]'); await pc.waitForTimeout(150);
  ok((await pc.textContent('main')).includes('Thanks 1 · Memory 2'), 'English labels');
  await pc.click('.memcard [data-a=memOpen]').catch(async () => { await navTo(pc, 'home'); await pc.click('.memcard [data-a=memOpen]'); });
  await pc.waitForSelector('.mempage'); await pc.click('[data-a=memDay][data-v=tue]'); await pc.waitForTimeout(150);
  const W = await pc.evaluate(() => ['He', 'is', 'the', 'image', 'of', 'the', 'invisible', 'God,', 'the', 'firstborn', 'of', 'all', 'creation.']);
  for (const sl of await pc.$$eval('.mslot', e => e.map(x => +x.dataset.v))) { const bl = await (async () => { for (const x of await pc.$$('.mbank .mblk')) if ((await x.textContent()).trim() === W[sl]) return x; })(); await bl.click(); await pc.waitForTimeout(60); const s2 = await pc.$(`.mslot[data-v="${sl}"]`); if (s2) { await s2.click(); await pc.waitForTimeout(80); } }
  await pc.waitForTimeout(300);
  ok((await pc.textContent('#stkgot')).includes("Great job memorizing God's Word! You earned a sticker!"), 'English celebration message');

  ok(errs.length === 0, 'no script errors ' + JSON.stringify(errs));
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nMemory stickers: all checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
