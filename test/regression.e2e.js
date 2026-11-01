/* Every screen in both languages and three screen sizes: no script errors, no sideways scrolling,
   no Korean left on English screens. node test/regression.e2e.js http://localhost:3000 [shots] */
const { chromium } = require('playwright');
/* a fixed day so weekly content doesn't change under the test: #31 by default, TEST_DATE=2026-10-27T10:00:00 for #32 */
require('./_pin-date')(chromium, new Date(process.env.TEST_DATE || '2026-10-21T10:00:00'));
const BASE = process.argv[2], OUT = process.argv[3] || '';
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  ✗ ' + m); } };
(async () => {
  const b = await chromium.launch();
  for (const [vw, vh, tag] of [[360, 640, 'small'], [390, 844, 'phone'], [820, 1180, 'ipad']]) {
    const ctx = await b.newContext({ viewport: { width: vw, height: vh } });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    const check = async (name, en) => {
      await p.waitForTimeout(150);
      const r = await p.evaluate(() => {
        const H = /[가-힣]/, out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) { const el = n.parentElement; if (!el || el.closest('script,style,noscript,[hidden]')) continue; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const tx = n.textContent.trim(); if (H.test(tx) && tx !== '한국어' && tx !== '가') out.push(tx.slice(0, 50)); }
        document.querySelectorAll('[aria-label],[placeholder]').forEach(e => { const v = e.getAttribute('aria-label') || e.getAttribute('placeholder'); if (H.test(v) && v !== '한국어') out.push('@' + v.slice(0, 50)); });
        return { ko: out, wide: document.documentElement.scrollWidth - innerWidth };
      });
      ok(r.wide <= 1, `${tag}/${name}: sideways scroll ${r.wide}px`);
      if (en) ok(r.ko.length === 0, `${tag}/${name}: Korean left in English → ${JSON.stringify(r.ko.slice(0, 4))}`);
      if (OUT && tag !== 'small') await p.screenshot({ path: `${OUT}/r_${tag}_${en ? 'en' : 'ko'}_${name}.png` });
    };
    const go = async v => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(120); };
    for (const en of [false, true]) {
      await ctx.clearCookies(); await p.goto(BASE); await p.evaluate(() => localStorage.clear()); await p.reload();
      await p.waitForSelector('form[data-form=login]');
      if (en) { await p.click('.langtog [data-v=en]'); await p.waitForTimeout(100); }
      await check('login', en);
      await p.click('[data-a=authMode][data-v=recover]'); await check('recover', en);
      await p.click('[data-a=authMode][data-v=login]'); await p.click('[data-a=authMode][data-v=signup]');
      const u = 'r' + tag.slice(0, 2) + (en ? 'e' : 'k') + String(Date.now()).slice(-7);
      await p.fill('#f-username', u); await p.waitForTimeout(600); await check('signup', en);
      await p.fill('#f-password', 'regress-1'); await p.fill('#f-password2', 'regress-1');
      await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
      await check('recoverycode', en);
      await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]'); await p.waitForTimeout(150);
      await check('onboard1', en); await p.click('[data-a=obNext]'); await check('onboard2', en); await p.click('[data-a=start]');
      await check('home', en);
      if (await p.$('.wkb')) { await p.click('.wkb'); await p.waitForTimeout(150); await check('home_otherweek', en); await go('bible'); await check('bible_otherweek', en); await go('home'); await p.click('.wkb'); await p.waitForTimeout(150); }
      await go('bible'); await check('bible', en);
      await go('home'); const keys = await p.$$eval('.daycard[data-a=lesson]', e => e.map(x => x.dataset.v));
      await p.evaluate(() => document.querySelector('[data-a="go"][data-v="calendar"]').click()); await check('calendar', en);
      const dayOf = k => new Date(...k.split('-').map((x, j) => j === 1 ? x - 1 : +x)).getDay();
      const tue = keys.find(k => dayOf(k) === 2);
      await go('home'); await p.evaluate(k => document.querySelector(`.daycard[data-v="${k}"]`).click(), tue); await check('quiz', en);
      await p.click('.vref >> nth=0'); await p.waitForTimeout(500); ok(!!(await p.$('#vpop')), tag + ': verse pop-up opens'); await check('versepop', en);
      await p.keyboard.press('Escape'); await p.waitForTimeout(100);
      await check('quiz_memcard', en);
      const mon = keys.find(k => dayOf(k) === 1);
      if (mon) { await go('home');
        await p.evaluate(k => document.querySelector(`.daycard[data-v="${k}"]`).click(), mon); await check('quiz_mon', en);
        if (await p.$('.qdraw')) { await p.click('.qdraw'); await p.waitForSelector('.ink'); await check('draw', en); await p.click('[data-ik=close]'); await p.waitForTimeout(200); } }
      await go('home'); await p.click('.memcard [data-a=memOpen]'); await p.waitForSelector('.mempage');
      for (const d of ['mon', 'tue', 'wed', 'thu', 'fri']) { await p.click(`[data-a=memDay][data-v=${d}]`); await p.waitForTimeout(300); await check('memory_' + d, en); }
      await p.click('#backfix .backbtn'); await p.waitForTimeout(150);
      await go('thanks'); await check('thanks', en);
      await go('parent'); await check('parent', en);
      await p.click('.pcard.big'); await p.waitForTimeout(150); await check('pguide_week', en);
      await go('parent'); await p.click('.pcard[data-v=fri]'); await p.waitForTimeout(150); await check('pguide_fri', en);
      await go('profile'); await check('profile', en);
      await p.evaluate(() => document.getElementById('wardrobe').scrollIntoView()); const y = await p.evaluate(() => scrollY);
      await p.click('[data-a=setCat][data-v=bottom]'); await p.waitForTimeout(150);
      ok(Math.abs((await p.evaluate(() => scrollY)) - y) <= 1, tag + ': wardrobe category tap does not move the page');
      await p.click('[data-a=go][data-v=stickers]'); await check('stickers', en);
      for (const m of ['pw', 'code', 'delete']) { await go('profile'); await p.click(`[data-a=acct][data-v="${m}"]`); await check('acct_' + m, en); }
      await go('profile'); await p.click('[data-a=logout]'); await p.waitForSelector('form[data-form=login]');
    }
    ok(errs.length === 0, tag + ': script errors ' + JSON.stringify(errs));
    await ctx.close();
  }
  await b.close();
  console.log(fails ? fails + ' problem(s)' : 'Regression: all screens OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
