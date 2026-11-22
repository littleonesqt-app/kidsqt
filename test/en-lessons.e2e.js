/* English mode: lesson cards (questions, options, activity, confession) must not show Korean text. */
const { chromium } = require('playwright');
const { context } = require('./_pin-date');
(async () => {
  const b = await chromium.launch(); let fails = 0;
  for (const [pin, days] of [[new Date(2026, 10, 13, 10), [9, 10, 11, 12, 13]], [new Date(2026, 10, 20, 10), [16, 17, 18, 19, 20]], [new Date(2026, 10, 27, 10), [23, 24, 25, 26, 27]]]) {
    const ctx = await context(await b.newContext({ viewport: { width: 390, height: 844 } }), pin);
    const p = await ctx.newPage();
    await p.goto('file://' + require('path').resolve(__dirname, '../demo/devotion-app.html')); await p.waitForTimeout(500);
    if (await p.$('[data-a=obNext]')) { await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); await p.click('[data-a=start]'); }
    await p.waitForSelector('.daygrid'); await p.getByText('English', { exact: true }).first().click(); await p.waitForTimeout(300);
    for (const d of days) {
      await p.click(`.daycard[data-v="2026-11-${d}"]`); await p.waitForSelector('#qcard-0');
      const bad = await p.evaluate(() => [...document.querySelectorAll('[id^=qcard-],#actcard,#confcard')].map(e => e.innerText.split('\n').filter(l => /[가-힣]/.test(l))).flat());
      if (bad.length) { fails++; console.log('  ✗ 11-' + d + ' Korean in English mode:', bad.slice(0, 3)); } else console.log('  ✓ 11-' + d + ' English only');
      await p.evaluate(() => document.querySelector('[data-a=go]').click()); await p.waitForSelector('.daygrid');
    }
  }
  await b.close();
  if (fails) { console.log('English lessons: FAILED'); process.exit(1); } console.log('English lessons: all checks passed');
})();
