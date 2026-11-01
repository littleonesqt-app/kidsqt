/* Read-along: while a verse is read aloud its text is highlighted, and the spoken word is marked when the device
   reports word positions. Speech is faked so the test is deterministic.
   node test/readalong.e2e.js file:///…/demo/devotion-app.html */
const { chromium } = require('playwright');
const BASE = process.argv[2];
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(200); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    window.__spoken = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => [], cancel() { (window.__timers || []).forEach(clearTimeout); window.__timers = []; },
      speak(u) {
        window.__spoken.push(u.text); window.__timers = window.__timers || [];
        const words = [...u.text.matchAll(/\S+/g)].map(m => m.index);
        words.forEach((ix, k) => window.__timers.push(setTimeout(() => u.onboundary && u.onboundary({ name: 'word', charIndex: ix }), 120 + k * 120)));
        window.__timers.push(setTimeout(() => u.onend && u.onend(), 150 + words.length * 120));
      }
    } });
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE); await p.waitForTimeout(600);
  if (await p.$('[data-a=obNext]')) { await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); await p.click('[data-a=start]'); }
  await p.waitForSelector('.daygrid');
  await navTo(p, 'bible'); await p.click('[data-a=bkOpen]'); await p.waitForSelector('#bkpages .bk-vt'); await p.waitForTimeout(1300);
  ok((await p.$$('#bkpages .bk-vt .w')).length > 3, 'the verse text is split into words');
  ok(!(await p.$('#bkpages .bk-vt.now')), 'nothing is marked before reading');
  await p.click('[data-a=tts]'); await p.waitForTimeout(100);
  ok(!!(await p.$('#bkpages .bk-vt.now')) && !!(await p.$('#bkpages .vn.now')), 'the verse being read is highlighted');
  await p.waitForTimeout(250);
  const w1 = await p.$$eval('#bkpages .bk-vt .w.on', e => e.map(x => x.textContent));
  await p.waitForTimeout(240);
  const w2 = await p.$$eval('#bkpages .bk-vt .w.on', e => e.map(x => x.textContent));
  ok(w1.length === 1 && w2.length === 1 && w1[0] !== w2[0], 'exactly one word is marked and it moves along: "' + w1[0] + '" → "' + w2[0] + '"');
  await p.click('[data-a=tts]'); await p.waitForTimeout(150);
  ok(!(await p.$('#bkpages .now')) && !(await p.$('#bkpages .w.on')), 'stopping clears every mark');
  await p.click('[data-a=tts]'); await p.waitForTimeout(3500);
  ok(!(await p.$('#bkpages .now')) && !(await p.$('#bkpages .w.on')), 'finishing the verse clears every mark');
  console.log(fails || errs.length ? '\nFAILED' : '\nRead-along: all checks passed'); if (errs.length) console.log(errs);
  await b.close(); process.exit(fails || errs.length ? 1 : 0);
})();
