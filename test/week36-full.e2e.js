/* The whole #36 week works like #31: each day's QT → celebration → calendar flower, Friday gift, thank-you flower +
   sticker, memory star + sticker. Pinned to Friday Oct 30 so every day is open to a child.
   node test/week33-full.e2e.js http://localhost:3000 [shots]     (also works on the demo file: file:///…/devotion-app.html) */
const { chromium } = require('playwright');
const BASE = process.argv[2], OUT = process.argv[3] || '';
const FRI = new Date(2026, 10, 27, 10, 0, 0);
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const text = async (p, s) => ((await p.textContent(s)) || '').replace(/\s+/g, ' ').trim();
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(150); };
const input = async (p, sel, v) => { await p.fill(sel, v); await p.evaluate(s => document.querySelector(s).dispatchEvent(new Event('input', { bubbles: true })), sel); };
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: `${OUT}/${n}.png` }); };

const ANSWER = {
  '2026-11-23': async p => {
    ok(/3분 동안 기다려/.test(await text(p, '#actcard')), 'Monday: optional activity box shown above the questions');
    await p.click('[data-a=qs][data-v="0:1"]'); await p.click('[data-a=qm][data-v="1:0"]'); await p.click('[data-a=qm][data-v="1:2"]');
    await input(p, '#qt-2', '하나님의 시간은 어떤 걸까?'); await input(p, '#qt-3', '조금 지루했을 것 같아요');
  },
  '2026-11-24': async p => {
    ok(!(await p.$('#actcard')), 'Tuesday: no activity box');
    await p.click('[data-a=qw][data-v="0:0"]'); await p.click('[data-a=qw][data-v="0:1"]');
    await p.click('[data-a=qs][data-v="1:1"]');
    for (const [l, r] of [[0, 2], [1, 0], [2, 1]]) { await p.click(`[data-a=ql][data-v="2:${l}"]`); await p.click(`[data-a=qr][data-v="2:${r}"]`); }
    await p.click('[data-a=qw][data-v="3:2"]'); await p.click('[data-a=qw][data-v="3:0"]'); await p.click('[data-a=qw][data-v="3:1"]');
  },
  '2026-11-25': async p => {
    ok(/거룩한 행실/.test(await text(p, '#qcard-1 .hintbox')) && !/도움말/.test(await text(p, '#qcard-1 > div:nth-of-type(2)')), 'Wednesday Q2: the hint is its own box, not part of the question text');
    await p.click('[data-a=qs][data-v="0:1"]'); await input(p, '#qt-1', '거룩하게 살라고 했을 거예요'); await p.click('[data-a=qs][data-v="2:0"]');
  },
  '2026-11-26': async p => {
    await p.click('[data-a=qs][data-v="0:1"]'); await p.click('[data-a=qw][data-v="1:0"]'); await p.click('[data-a=qw][data-v="1:2"]');
    for (const [l, r] of [[0, 1], [1, 0]]) { await p.click(`[data-a=ql][data-v="2:${l}"]`); await p.click(`[data-a=qr][data-v="2:${r}"]`); }
  },
  '2026-11-27': async p => {
    ok(/약속을 반드시 지키세요/.test(await text(p, '#confcard')), 'Friday: the "Remember!" confession is shown');
    await p.click('[data-a=qm][data-v="0:0"]'); await p.click('[data-a=qm][data-v="1:0"]'); await p.click('[data-a=qm][data-v="1:2"]');
    await input(p, '[data-qf="2:0"]', '친구에게 먼저 친절하게 말할 거예요');
  }
};

(async () => {
  const b = await chromium.launch();
  const ctx = await require('./_pin-date').context(await b.newContext({ viewport: { width: 390, height: 844 } }), FRI);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE); await p.waitForTimeout(600);
  if (await p.$('form[data-form=login]')) {
    const u = 'w36' + String(Date.now()).slice(-8);
    await p.click('[data-a=authMode][data-v=signup]');
    await p.fill('#f-username', u); await p.fill('#f-password', 'week36-ok'); await p.fill('#f-password2', 'week36-ok');
    await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
    await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]');
  }
  if (await p.$('[data-a=obNext]')) { await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); await p.click('[data-a=start]'); }
  await p.waitForSelector('.daygrid');
  ok((await text(p, 'main')).includes('11월 4주'), 'week 11월 4주');

  console.log('\nEach day: QT → celebration → calendar flower');
  for (const [k, answer] of Object.entries(ANSWER)) {
    await navTo(p, 'home'); await p.click(`.daycard[data-v="${k}"]`); await p.waitForSelector('#qcard-0');
    await answer(p); await p.waitForTimeout(250);
    if (!(await p.$('[data-a=celCal]'))) { await p.click('[data-a=finish]'); await p.waitForTimeout(150); if (await p.$('[data-a=finish][data-v=force]')) await p.click('[data-a=finish][data-v=force]'); }
    await p.waitForTimeout(300);
    const cel = !!(await p.$('[data-a=celCal]'));
    if (cel) await p.click('[data-a=celCal]'); await p.waitForTimeout(500);
    const cell = await p.evaluate(k => { const d = +k.slice(8); const b = [...document.querySelectorAll('.cday')].find(x => new RegExp('11월 ' + d + '일').test(x.getAttribute('aria-label') || '')); return b ? { lab: b.getAttribute('aria-label'), cls: b.querySelector('.c').className, flower: !!b.querySelector('.smile-new,svg') } : null; }, k);
    ok(cel && cell && /done/.test(cell.cls) && cell.flower, `${k}: celebration, calendar shows the flower (${cell && cell.lab})`);
  }
  await shot(p, 'w32_calendar');
  const gift = await p.$('[data-a=gift]');
  ok(!!gift, 'Friday: the gift is ready on the calendar');
  if (gift) { await gift.click(); await p.waitForTimeout(400); }
  ok(!!(await p.$('#giftpick')) && (await p.$$('#giftpick [data-a=giftSel]')).length >= 2, 'the gift screen asks to pick ONE item');
  ok(!!(await p.$('[data-a=giftConfirm][aria-disabled=true]')), 'cannot confirm before choosing');
  const gid = await p.$eval('#giftpick [data-a=giftSel]', e => e.getAttribute('data-v'));
  await p.click('#giftpick [data-a=giftSel]'); await p.waitForTimeout(150);
  await shot(p, 'w32_giftpick');
  await p.click('[data-a=giftConfirm]'); await p.waitForTimeout(400);
  ok(!(await p.$('#giftpick')) && /선물/.test(await text(p, 'main')), 'gift claimed (wardrobe / gift message)');
  const tiles = await p.$$eval('#wardrobe .tile', t => ({ n: t.length, locked: t.filter(x => x.classList.contains('locked')).length }));
  ok(tiles.locked >= tiles.n - 3 && tiles.locked < tiles.n - 1, /* the shirt slot also holds free starter shirts */ 'only the chosen item (' + gid + ') is unlocked in the wardrobe, the others stay locked (' + tiles.locked + '/' + tiles.n + ' locked)');

  console.log('\nThank-you note → flower and sticker');
  await navTo(p, 'thanks');
  await input(p, '[data-note$="-fri"]', '친구가 생겨서 감사해요'); await p.click('[data-a=noteDone][data-v$="-fri"]'); await p.waitForTimeout(2600);
  ok(!!(await p.$('[id$="-fri"].nstk svg, #stk-2026-11-23-fri svg')), 'Friday note: sticker on the note');
  ok((await text(p, '#stkbanner')).includes('1'), 'this week has 1 sticker');

  console.log('\nMemory practice → star and sticker');
  await navTo(p, 'home'); await p.click('.memcard [data-a=memOpen]'); await p.waitForSelector('.mempage');
  ok((await text(p, '.mempage')).includes('베드로후서 3:9'), 'practice uses 2 Peter 3:9');
  await p.click('[data-a=memDay][data-v=wed]'); await p.waitForTimeout(150); await p.click('[data-a=memFinish][data-v=wed]'); await p.waitForTimeout(400);
  ok(await p.$$eval('.mtab[data-v=wed] svg', e => e.length) > 0, 'Wednesday star');
  await p.click('#backfix .backbtn'); await p.waitForTimeout(200);
  await navTo(p, 'profile');
  ok(/감사 1 · 암송 1/.test(await text(p, 'main')), 'Profile stickers: thanks 1 · memory 1');

  ok(errs.length === 0, 'no script errors ' + JSON.stringify(errs));
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\n#36 full week: all checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
