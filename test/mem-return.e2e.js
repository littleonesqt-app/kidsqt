/* The day's flow: questions → memory practice → back to the QT page → "오늘 묵상 완료!" → celebration → calendar.
   A child account on Wednesday Oct 28 (#32). node test/mem-return.e2e.js http://localhost:3000 [shots] */
const { chromium } = require('playwright');
const BASE = process.argv[2], OUT = process.argv[3] || '';
const WED = new Date(2026, 9, 28, 10, 0, 0);
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const text = async (p, s) => { const e = await p.$(s); return e ? ((await e.textContent()) || '').replace(/\s+/g, ' ').trim() : ''; };
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: `${OUT}/${n}.png` }); };
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(150); };
const inView = (p, s) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }, s);
const input = async (p, sel, v) => { await p.fill(sel, v); await p.evaluate(s => document.querySelector(s).dispatchEvent(new Event('input', { bubbles: true })), sel); };

(async () => {
  const b = await chromium.launch();
  const ctx = await require('./_pin-date').context(await b.newContext({ viewport: { width: 390, height: 844 } }), WED);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE); await p.waitForTimeout(600);
  if (await p.$('form[data-form=login]')) {
    const user = 'mr' + String(Date.now()).slice(-8);
    await p.click('[data-a=authMode][data-v=signup]');
    await p.fill('#f-username', user); await p.fill('#f-password', 'return-1'); await p.fill('#f-password2', 'return-1');
    await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
    await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]');
  }
  if (await p.$('[data-a=obNext]')) { await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); await p.click('[data-a=start]'); }
  await p.waitForSelector('.daygrid');

  console.log('\n1. Answer all of today’s questions');
  await p.click('.daycard[data-v="2026-10-28"]'); await p.waitForSelector('#qcard-0');
  ok((await text(p, '#memcard')).includes('마지막 단계'), 'the memory card is the last step of the QT page');
  await p.click('[data-a=qs][data-v="0:1"]'); await p.click('[data-a=qm][data-v="1:0"]'); await p.click('[data-a=qm][data-v="1:2"]');
  await p.click('[data-a=qox][data-v="2:0:X"]'); await p.click('[data-a=qox][data-v="2:1:O"]'); await p.click('[data-a=qw][data-v="3:1"]');
  await p.waitForTimeout(500);
  ok(!(await p.$('.overlay .dialog')), 'no celebration yet');
  ok((await text(p, '.toast')).includes('암송 연습을 해요') && !!(await p.$('#memcard .btn.nudge')), 'points to the memory practice');
  ok(await inView(p, '#memcard'), 'memory card scrolled into view');
  await shot(p, 'mr_1_answered');

  console.log('\n2. Tapping finish before the practice asks first');
  await p.click('#qbtn [data-a=finish]'); await p.waitForTimeout(300);
  ok(!(await p.$('.overlay .dialog')) && (await text(p, '#qbtn')).includes('아직 오늘의 암송 연습을 안 했어요'), 'asks to do the memory practice');
  await shot(p, 'mr_2_ask');

  console.log('\n3. Memory practice, then back to the QT page');
  await p.click('#qbtn [data-a=memOpen]'); await p.waitForSelector('.mempage');
  ok((await p.getAttribute('.mtab.on', 'data-v')) === 'wed', 'opens Wednesday’s practice');
  await p.click('[data-a=memFinish][data-v=wed]'); await p.waitForTimeout(500);
  ok(!!(await p.$('.mempage')), 'stays a moment for the star and sticker');
  await p.waitForSelector('#qbtn .btn.nudge', { timeout: 4000 });
  ok(!(await p.$('.mempage')) && !!(await p.$('#qcard-0')), 'back on Wednesday’s QT page by itself');
  ok(await inView(p, '#qbtn') && (await text(p, '#qbtn')) === '오늘 묵상 완료!', '“오늘 묵상 완료!” on screen');
  ok((await text(p, '.toast')).includes('오늘 묵상 완료!'), 'says to tap it');
  ok(await p.$$eval('section[id^=qcard-] .donecheck:not([hidden])', e => e.length) === 4, 'answers are still there');
  await shot(p, 'mr_3_back');

  console.log('\n4. Finish → celebration → calendar');
  await p.click('#qbtn [data-a=finish]'); await p.waitForTimeout(300);
  ok(!!(await p.$('.overlay .dialog')), 'celebration');
  await shot(p, 'mr_4_celebration');
  await p.click('[data-a=celCal]'); await p.waitForTimeout(500);
  const cell = await p.evaluate(() => { const b = [...document.querySelectorAll('.cday')].find(x => /10월 28일/.test(x.getAttribute('aria-label') || '')); return b ? b.getAttribute('aria-label') : ''; });
  ok(cell.includes('큐티 완료'), 'calendar: Wednesday has its flower');

  console.log('\n5. After the celebration the practice is still reachable');
  await navTo(p, 'home'); await p.click('.daycard[data-v="2026-10-28"]'); await p.waitForSelector('#memcard');
  ok((await text(p, '#memcard')).includes('한 번 더 연습하기'), 'QT page: practise again');
  await p.click('#memcard [data-a=memOpen]'); await p.waitForSelector('.mempage');
  ok((await p.getAttribute('.mtab.on', 'data-v')) === 'wed', 'opens Wednesday’s practice again');
  await p.click('#backfix .backbtn'); await p.waitForTimeout(200);

  console.log('\n6. Practice first, questions after (Tuesday)');
  await navTo(p, 'home'); await p.click('.daycard[data-v="2026-10-27"]'); await p.waitForSelector('#memcard');
  await p.click('#memcard [data-a=memOpen]'); await p.waitForSelector('.mempage');
  ok((await p.getAttribute('.mtab.on', 'data-v')) === 'tue', 'opens Tuesday’s practice');
  for (let guard = 0; guard < 20 && (await p.$('.mempage .mslot')); guard++) {   // a blank's own word block has the same index
    const i = await p.getAttribute('.mempage .mslot', 'data-v');
    await p.click(`.mblk[data-v="${i}"]`); await p.waitForTimeout(80);
    if (await p.$(`.mempage .mslot[data-v="${i}"]`)) await p.click(`.mempage .mslot[data-v="${i}"]`);
    await p.waitForTimeout(120);
  }
  await p.waitForSelector('#qbtn', { timeout: 5000 });
  ok(!(await p.$('.mempage')), 'back on Tuesday’s QT page');
  ok((await text(p, '.toast')).includes('남은 문제를 풀고'), 'says to finish the questions');
  await p.click('[data-a=qs][data-v="0:1"]'); await p.click('[data-a=qg][data-v="1:0:0"]'); await p.click('[data-a=qg][data-v="1:1:1"]');
  await p.click('[data-a=qs][data-v="2:1"]'); await input(p, '#qt-3', '그것을 내 앞으로 계산하라'); await p.waitForTimeout(300);
  ok(!(await p.$('.overlay .dialog')) && (await text(p, '.toast')).includes('오늘 묵상 완료!'), 'all answered: now points to “오늘 묵상 완료!”, no celebration yet');
  await p.click('#qbtn [data-a=finish]'); await p.waitForTimeout(300);
  ok(!!(await p.$('.overlay .dialog')), 'finish → celebration right away (practice already done)');
  await p.click('[data-a=celClose]'); await p.waitForTimeout(150);

  console.log('\n7. Practice opened from Home stays put');
  await navTo(p, 'home'); await p.click('.memcard [data-a=memOpen]'); await p.waitForSelector('.mempage');
  await p.click('[data-a=memFinish][data-v=wed]'); await p.waitForTimeout(2600);
  ok(!!(await p.$('.mempage')), 'still on the practice page');

  ok(errs.length === 0, 'no script errors ' + JSON.stringify(errs));
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nQT → memory → finish flow: all checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
