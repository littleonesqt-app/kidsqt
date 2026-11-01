/* Memory practice sounds: tapping words speaks them (Tue/Wed/Thu), Monday is listen → wait → say it back,
   Friday shows the verse for a while, hides it, then offers the recorder. Speech is faked.
   node test/mem-sound.e2e.js file:///…/demo/devotion-app.html */
const { chromium } = require('playwright');
const BASE = process.argv[2];
const FRI = new Date(2026, 9, 30, 10, 0, 0);
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await require('./_pin-date').context(await b.newContext({ viewport: { width: 390, height: 844 } }), FRI);
  await ctx.addInitScript(() => {
    window.__spoken = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => [], cancel() {}, speak(u) { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 60); } } });
  });
  const p = await ctx.newPage(); p.on('pageerror', e => { console.log('  pageerror', e.message); fails++; });
  await p.goto(BASE); await p.waitForTimeout(600);
  if (await p.$('[data-a=obNext]')) { await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); await p.click('[data-a=start]'); }
  await p.waitForSelector('.daygrid');
  await p.click('[data-a=memOpen]'); await p.waitForSelector('.mempage');
  const spoken = () => p.evaluate(() => window.__spoken.slice());
  const clear = () => p.evaluate(() => { window.__spoken = []; });
  const day = async d => { await p.click('[data-a=memDay][data-v=' + d + ']'); await p.waitForTimeout(250); await clear(); };

  console.log('\nTuesday');
  await day('tue');
  const tw = await p.$eval('.mbank .mblk', e => e.textContent.trim());
  await p.click('.mbank .mblk'); await p.waitForTimeout(150);
  ok((await spoken()).includes(tw), 'tapping a word block says it: "' + tw + '"');

  console.log('\nWednesday');
  await day('wed');
  await p.click('.mtile'); await p.waitForTimeout(150);
  const wt = (await p.$eval('.mtile.rev', e => e.textContent.trim()));
  ok((await spoken()).includes(wt), 'revealing a word says it: "' + wt + '"');

  console.log('\nThursday');
  await day('thu');
  const hw = await p.$eval('.mbank .mblk', e => e.textContent.trim());
  await p.click('.mbank .mblk'); await p.waitForTimeout(150);
  ok((await spoken()).includes(hw), 'tapping a block says it: "' + hw + '"');

  console.log('\nMonday: listen, wait, say it back');
  await day('mon');
  const phrases = await p.$$eval('.mphr', e => e.length);
  await p.click('[data-a=memListen]'); await p.waitForSelector('.mecho:not(.listen)', { timeout: 4000 });
  ok((await spoken()).length === 1, 'the first part is read, then it waits');
  ok(!!(await p.$('.mphr.on.echo')) && !!(await p.$('.mecho .mcd i')) && !!(await p.$('[data-a=memSkip]')), 'shows “now you say it”, a countdown and a skip button');
  await p.click('[data-a=memSkip]'); await p.waitForTimeout(300);
  ok((await spoken()).length === 2, 'skipping moves on to the next part');
  for (let i = 2; i <= phrases + 1; i++) { if (await p.$('[data-a=memSkip]')) await p.click('[data-a=memSkip]'); await p.waitForTimeout(250); }
  await p.waitForTimeout(300);
  ok((await spoken()).length === phrases && !(await p.$('.mecho')), 'every part is read once, then it ends');
  ok(await p.$eval('[data-a=memFinish][data-v=mon]', e => e.classList.contains('orange')), 'the finish button is ready afterwards');

  console.log('\nFriday: look, it disappears, then record');
  await day('fri');
  ok(!!(await p.$('.mverse .mword')) && !!(await p.$('.mcd i')) && !(await p.$('.mrec')), 'the verse is shown with a timer and no recorder yet');
  await p.click('[data-a=memFriHide]'); await p.waitForTimeout(250);
  ok(!(await p.$('.mverse .mword')) && !!(await p.$('.mrec')), 'the verse is hidden and the record button appears');
  ok(!!(await p.$('[data-a=memPeek]')), 'one peek is offered');
  await p.click('[data-a=memPeek]'); await p.waitForTimeout(250);
  ok(!!(await p.$('.mverse .mword')) && !(await p.$('.mrec')), 'peeking shows the verse again');
  await p.click('[data-a=memFriHide]'); await p.waitForTimeout(250);
  ok(!!(await p.$('.mrec')) && !(await p.$('[data-a=memPeek]')), 'recorder is back and the peek is used up');
  await day('fri');
  const t0 = Date.now(); await p.waitForSelector('.mrec', { timeout: 15000 });
  ok(Date.now() - t0 > 3000, 'the verse hides by itself after a few seconds (' + Math.round((Date.now() - t0) / 100) / 10 + 's)');
  console.log(fails ? '\nFAILED' : '\nMemory sounds: all checks passed'); await b.close(); process.exit(fails ? 1 : 0);
})();
