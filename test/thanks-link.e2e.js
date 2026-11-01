/* Thank-you note is linked to the QT: the celebration asks for one line (can be skipped), and Home reminds
   when today's QT is done but the note is empty. node test/thanks-link.e2e.js http://localhost:3000 */
const { chromium } = require('playwright');
const BASE = process.argv[2];
const WED = new Date(2026, 9, 28, 10, 0, 0);
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const text = async (p, s) => { const e = await p.$(s); return e ? ((await e.textContent()) || '').replace(/\s+/g, ' ').trim() : ''; };
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(200); };
async function finishDay(b, pw) {
  const ctx = await require('./_pin-date').context(await b.newContext({ viewport: { width: 390, height: 844 } }), WED);
  const p = await ctx.newPage(); p.on('pageerror', e => { console.log('  pageerror', e.message); fails++; });
  await p.goto(BASE); await p.waitForTimeout(600);
  const user = 'tl' + String(Date.now()).slice(-8) + Math.floor(Math.random() * 9);
  await p.click('[data-a=authMode][data-v=signup]');
  await p.fill('#f-username', user); await p.fill('#f-password', pw); await p.fill('#f-password2', pw);
  await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
  await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]');
  if (await p.$('[data-a=obNext]')) { await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); await p.click('[data-a=start]'); }
  await p.waitForSelector('.daygrid');
  ok(!(await p.$('.thcard')), 'no reminder before the QT is done');
  await p.click('.daycard[data-v="2026-10-28"]'); await p.waitForSelector('#qcard-0');
  await p.click('[data-a=qs][data-v="0:1"]'); await p.click('[data-a=qm][data-v="1:0"]'); await p.click('[data-a=qm][data-v="1:2"]');
  await p.click('[data-a=qox][data-v="2:0:X"]'); await p.click('[data-a=qox][data-v="2:1:O"]'); await p.click('[data-a=qw][data-v="3:1"]');
  await p.waitForTimeout(500);
  await p.click('#qbtn [data-a=finish]'); await p.waitForTimeout(300);
  await p.click('#qbtn [data-a=memOpen]'); await p.waitForSelector('.mempage');
  await p.click('[data-a=memFinish][data-v=wed]'); await p.waitForSelector('#qbtn .btn.nudge', { timeout: 4000 });
  await p.click('#qbtn [data-a=finish]'); await p.waitForSelector('.overlay .dialog');
  return p;
}
(async () => {
  const b = await chromium.launch();
  console.log('\n1. Write the thank-you in the celebration');
  let p = await finishDay(b, 'thank-1');
  ok(!!(await p.$('.overlay #celta')), 'the celebration has a thank-you box');
  ok(await p.$eval('.overlay .ndone', e => e.hidden), 'the button waits for a few words');
  await p.fill('#celta', '맛있는 밥을 먹어서 감사해요'); await p.evaluate(() => document.getElementById('celta').dispatchEvent(new Event('input', { bubbles: true })));
  ok(!(await p.$eval('.overlay .ndone', e => e.hidden)), 'button appears once there is text');
  await p.click('.overlay [data-a=celThank]'); await p.waitForTimeout(400);
  ok(!!(await p.$('.overlay .celdone')) && !(await p.$('.overlay #celta')), 'shows it was saved');
  await p.click('.overlay [data-a=celClose]'); await p.waitForTimeout(200); await navTo(p, 'home');
  ok(!(await p.$('.thcard')), 'no reminder on Home once written');
  await navTo(p, 'thanks');
  ok((await p.$eval('#n-wed', e => e.value)).includes('맛있는 밥'), 'the note is in the Thank-You Notes tab');
  await p.context().close();

  console.log('\n2. Skip it → Home reminds → write there');
  p = await finishDay(b, 'thank-2');
  await p.click('.overlay [data-a=celClose]'); await p.waitForTimeout(200); await navTo(p, 'home');
  ok(!!(await p.$('.thcard')), 'Home shows the reminder');
  await p.click('.thcard'); await p.waitForTimeout(300);
  ok(!!(await p.$('#n-wed')), 'tapping it opens Thank-You Notes');
  await p.fill('#n-wed', '가족이 있어서 감사해요'); await p.evaluate(() => document.getElementById('n-wed').dispatchEvent(new Event('input', { bubbles: true })));
  await p.click('[data-a=noteDone][data-v$="-wed"]'); await p.waitForTimeout(300);
  await navTo(p, 'home');
  ok(!(await p.$('.thcard')), 'reminder gone after writing');
  await p.context().close();
  console.log(fails ? '\nFAILED' : '\nThank-you link: all checks passed'); await b.close(); process.exit(fails ? 1 : 0);
})();
