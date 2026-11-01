/* Bible storybook, end to end: node test/bible-book.e2e.js http://localhost:3000 [shots] */
const { chromium } = require('playwright');
/* the #31 week (Colossians), so this test keeps working after the weeks change */
require('./_pin-date')(chromium, new Date(2026, 9, 21, 10, 0, 0));
const BASE = process.argv[2], OUT = process.argv[3] || '';
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: OUT + '/' + n + '.png' }); };
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(200); };
const ref = p => p.evaluate(() => { const r = document.querySelector('#bkpages .bk-page.r .bk-ref'); return r ? r.textContent : (document.querySelector('#bkpages .bk-end') ? 'END' : null); });
const prog = p => p.evaluate(() => { const e = document.querySelector('.bk-pnum'); return e ? e.textContent : null; });
const server = p => p.evaluate(() => fetch('/api/progress', { headers: { 'X-IAM-Client': '1' } }).then(r => r.json()).then(j => j.state));
const settle = p => p.waitForTimeout(950);
async function swipe(p, dx) {
  const b = await (await p.$('#bkstage')).boundingBox(), y = b.y + b.height * 0.55, x0 = b.x + b.width / 2 - dx / 2;
  await p.mouse.move(x0, y); await p.mouse.down(); await p.mouse.move(x0 + dx / 2, y + 4, { steps: 4 }); await p.mouse.move(x0 + dx, y + 6, { steps: 4 }); await p.mouse.up();
}
async function signup(b, vp, opts) {
  const ctx = await b.newContext(Object.assign({ viewport: vp }, opts || {})); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  const u = 'bk' + String(Date.now()).slice(-8) + Math.floor(Math.random() * 9);
  await p.goto(BASE); await p.waitForSelector('form[data-form=login]');
  await p.click('[data-a=authMode][data-v=signup]');
  await p.fill('#f-username', u); await p.fill('#f-password', 'reading-1'); await p.fill('#f-password2', 'reading-1');
  await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
  await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]'); await p.click('[data-a=obNext]'); await p.click('[data-a=start]');
  p.user = u; return p;
}

(async () => {
  const b = await chromium.launch();
  const p = await signup(b, { width: 390, height: 844 });
  await navTo(p, 'bible');

  console.log('\nCover');
  ok(!!(await p.$('.bk-closed')) && !(await p.$('#bkpages')), 'the page opens on the closed book cover');
  const cover = await p.textContent('.bk-closed');
  ok(cover.includes('예수님이 누구신지 바로 알아야 해요!') && cover.includes('골로새서 1:13-20'), 'cover shows the week title and passage');
  ok(!!(await p.$('.bk-closed .bk-cart svg[role=img]')), 'cover has the themed illustration');
  ok((await p.textContent('main h1')).includes('이번 주 성경 읽기') && !(await p.$('.pbg')), 'heading at the top (no top illustration)');
  ok(!(await p.$('#backfix .backbtn')), 'no back button on the cover');
  await shot(p, 'b_cover');

  console.log('\nOpening the book');
  await p.click('.bk-cbtns [data-a=bkOpen]'); await p.waitForTimeout(250);
  ok(!!(await p.$('.bk-leaf.fwd .bk-cover')), 'the cover swings open');
  await p.waitForTimeout(150); await shot(p, 'b_opening');
  await settle(p);
  ok(!(await p.$('.bk-leaf')), 'opening animation finishes');
  ok(await ref(p) === '골로새서 1:13', 'first page is verse 13');
  ok(await p.$$eval('#bkpages .bk-vt', e => e.length) === 1, 'exactly one verse on the page');
  ok((await prog(p)) === '1 / 8 절', 'progress 1 / 8');

  console.log('\nSide arrows and the swipe hint');
  ok(!!(await p.$('#bkhint')) && (await p.textContent('#bkhint')).includes('손가락으로 좌우로 밀거나 화살표를 눌러 책장을 넘겨보세요!'), 'first time: swipe hint shows');
  const geo = await p.evaluate(() => { const r = e => e.getBoundingClientRect(), bk = r(document.getElementById('bkbook')), pv = r(document.getElementById('bkprev')), nx = r(document.getElementById('bknext')), tx = r(document.querySelector('#bkpages .bk-page.r .bk-vt')), hn = r(document.getElementById('bkhint'));
    const hit = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    return { mid: Math.abs((pv.top + pv.bottom) / 2 - (bk.top + bk.bottom) / 2) < 2 && Math.abs((nx.top + nx.bottom) / 2 - (bk.top + bk.bottom) / 2) < 2,
      edges: pv.left < bk.left && pv.right > bk.left && nx.right > bk.right && nx.left < bk.right, inside: pv.left >= 0 && nx.right <= innerWidth,
      size: pv.width >= 44 && pv.height >= 44 && nx.width >= 44, text: !hit(pv, tx) && !hit(nx, tx), hint: !hit(hn, tx),
      bottom: !document.querySelector('#bknav button') }; });
  ok(geo.mid, 'arrows sit at the middle height of the book');
  ok(geo.edges, 'arrows overlap the left and right edges of the book');
  ok(geo.inside, 'arrows stay on screen');
  ok(geo.size, 'arrows are at least 44×44');
  ok(geo.text, 'arrows do not cover the verse');
  ok(geo.hint, 'hint does not cover the verse');
  ok(geo.bottom, 'no arrows left under the book (progress only)');
  ok(await p.$eval('#bkprev', e => e.disabled) && !(await p.$eval('#bknext', e => e.disabled)), 'first page: previous off, next on');
  await shot(p, 'b_hint');
  await p.click('#bknext'); await p.waitForTimeout(450);
  ok(!(await p.$('#bkhint')), 'turning a page hides the hint right away');
  await settle(p);
  ok(await ref(p) === '골로새서 1:14' && (await prog(p)) === '2 / 8 절' && !(await p.$eval('#bkprev', e => e.disabled)), 'right arrow: next verse, progress 2 / 8, previous now on');
  await p.click('#bkprev'); await settle(p);
  ok(await ref(p) === '골로새서 1:13' && (await prog(p)) === '1 / 8 절', 'left arrow: previous verse, progress 1 / 8');
  ok(!!(await p.$('#backfix .backbtn[data-a=bkClose]')), 'back button appears once the book is open');
  await p.click('#backfix .backbtn'); await p.waitForTimeout(200);
  ok(!!(await p.$('.bk-closed')) && !(await p.$('#backfix .backbtn')), 'back button closes the book to the cover');
  await p.click('.bk-cbtns [data-a=bkOpen]'); await settle(p);
  ok(await ref(p) === '골로새서 1:13', 'opening again goes back to the same page');
  await shot(p, 'b_page1');

  console.log('\nTurning pages');
  await p.click('[data-a=bkNext]'); await p.waitForTimeout(60);
  ok(!!(await p.$('.bk-leaf.fwd')), 'page-turn animation plays');
  await p.waitForTimeout(250); await shot(p, 'b_turning');
  await p.click('[data-a=bkNext]', { force: true }).catch(() => {});
  await settle(p);
  ok(await ref(p) === '골로새서 1:14', 'a second tap during the turn does not skip a verse');
  await swipe(p, -160); await settle(p);
  ok(await ref(p) === '골로새서 1:15', 'swipe left: next verse');
  ok((await p.textContent('#bkpages .bk-page.r')).includes('이번 주 암송 구절'), 'memory verse is marked');
  await swipe(p, 160); await settle(p);
  ok(await ref(p) === '골로새서 1:14', 'swipe right: previous verse');
  await p.keyboard.press('ArrowRight'); await settle(p);
  ok(await ref(p) === '골로새서 1:15', 'arrow key works too');
  ok((await prog(p)) === '3 / 8 절', 'progress 3 / 8');
  await p.click('[data-a=tr][data-v=both]'); await p.waitForTimeout(150);
  ok(await ref(p) === '골로새서 1:15' && !!(await p.$('#bkpages .bk-vsub')), 'showing both translations keeps the page');
  await p.click('[data-a=tr][data-v=ko]'); await p.waitForTimeout(100);

  console.log('\nSound toggle and saving');
  ok(await p.getAttribute('[data-a=bkSound]', 'aria-pressed') === 'true', 'page sound on by default');
  await p.click('[data-a=bkSound]'); await p.waitForTimeout(100);
  ok(await p.getAttribute('[data-a=bkSound]', 'aria-pressed') === 'false', 'sound turned off');
  await p.waitForTimeout(1800);
  let st = await server(p); const wk = Object.keys(st.bible || {})[0];
  ok(wk && st.bible[wk].p === 3 && st.bible[wk].id === 'col-1-13-20', 'reading position saved to the account');
  ok(st.flipSound === false, 'sound preference saved to the account');
  ok(!(st.bibleDone || {})[wk], 'not marked finished yet');

  console.log('\nComing back later / another device');
  await p.reload(); await p.waitForSelector('nav'); await navTo(p, 'bible');
  ok((await p.textContent('.bk-cbtns')).includes('이어서 읽기 · 3 / 8 절'), 'cover offers to continue at verse 3');
  await p.click('.bk-cbtns [data-a=bkOpen]'); await settle(p);
  ok(await ref(p) === '골로새서 1:15', 'continues at the same verse');
  ok(await p.getAttribute('[data-a=bkSound]', 'aria-pressed') === 'false', 'sound stays off after reload');
  ok(!(await p.$('#bkhint')), 'hint is not shown again on this device');
  const pad = await (await b.newContext({ viewport: { width: 820, height: 1180 }, hasTouch: true })).newPage(); pad.errs = []; pad.on('pageerror', e => pad.errs.push(e.message));
  await pad.goto(BASE); await pad.waitForSelector('form[data-form=login]');
  await pad.fill('#f-username', p.user); await pad.fill('#f-password', 'reading-1'); await pad.click('form[data-form=login] button[type=submit]');
  await pad.waitForSelector('nav'); await navTo(pad, 'bible');
  ok((await pad.textContent('.bk-cbtns')).includes('3 / 8'), 'iPad picks up the same reading position');
  await shot(pad, 'b_ipad_cover');
  await pad.click('.bk-cbtns [data-a=bkOpen]'); await pad.waitForTimeout(400); await shot(pad, 'b_ipad_opening'); await settle(pad);
  ok(!!(await pad.$('#bkhint')), 'a new device shows the hint once');
  await pad.waitForTimeout(5800);
  ok(!(await pad.$('#bkhint')), 'hint fades away by itself');
  ok(await pad.$$eval('#bkpages > .bk-page', e => e.map(x => x.className).join('|')) === 'bk-page l bk-orn|bk-page r', 'iPad shows a two-page spread');
  ok(await ref(pad) === '골로새서 1:15', 'iPad opens at verse 15');
  await shot(pad, 'b_ipad_page');
  await pad.click('[data-a=bkNext]'); await pad.waitForTimeout(330); await shot(pad, 'b_ipad_turning'); await settle(pad);
  ok(await ref(pad) === '골로새서 1:16', 'iPad page turn');
  const crop = await pad.evaluate(() => { const bd = document.querySelector('#bkpages .bk-page.r .bk-body'); return bd.scrollHeight <= bd.clientHeight + 1 || getComputedStyle(bd).overflowY === 'auto'; });
  ok(crop, 'long verse is never cut off (fits or scrolls)');

  console.log('\nThe end of the book');
  for (let i = 0; i < 8; i++) { if (await ref(p) === 'END') break; await p.click('[data-a=bkNext]'); await settle(p); }
  ok(await ref(p) === 'END', 'ending page after the last verse');
  ok((await p.textContent('.bk-end')).includes('하나님의 말씀을 잘 읽었어요!') && (await p.textContent('.bk-end')).includes('묵상하러 가기'), 'ending page message and button');
  ok(await p.$eval('[data-a=bkNext]', e => e.disabled), 'no page after the ending');
  ok(!(await p.$eval('#bkprev', e => e.disabled)), 'previous still works on the last page');
  await shot(p, 'b_end');
  await p.waitForTimeout(1800); st = await server(p);
  ok(st.bibleDone[wk] === true, 'finished is saved to the account');
  await p.click('.bk-end [data-a=go][data-v=quiz]'); await p.waitForTimeout(250);
  ok(!!(await p.$('#qprog')), '“묵상하러 가기” opens the existing daily QT');
  await navTo(p, 'bible');
  const c2 = await p.textContent('.bk-closed') + await p.textContent('.bk-cbtns');
  ok(c2.includes('읽기 완료') && c2.includes('다시 읽기'), 'after finishing: cover says finished, offers to read again');
  await p.click('.bk-cbtns [data-a=bkOpen]'); await settle(p);
  ok(await ref(p) === '골로새서 1:13', 'reading again starts at verse 13');

  console.log('\nEnglish');
  await navTo(p, 'home'); await p.click('[data-a=setLang][data-v=en]'); await p.waitForTimeout(150); await navTo(p, 'bible');
  const ce = await p.textContent('.bk-closed');
  ok(ce.includes("Let's Know Who Jesus Really Is!") && ce.includes('Colossians 1:13–20'), 'English cover');
  await p.click('.bk-cbtns [data-a=bkOpen]'); await settle(p);
  const er = await ref(p), ev = await p.textContent('#bkpages .bk-vt').catch(() => ''), eg = await prog(p);
  ok(er === 'Colossians 1:13' && ev.startsWith('He has delivered us'), 'English verse (ESV) ' + JSON.stringify([er, ev.slice(0, 30)]));
  ok(eg === 'Verse 1 of 8', 'English progress ' + JSON.stringify(eg));
  await shot(p, 'b_en');

  console.log('\nReduced motion and small phone');
  const rm = await signup(b, { width: 360, height: 640 }, { reducedMotion: 'reduce' });
  await navTo(rm, 'bible'); await shot(rm, 'b_small_cover');
  await rm.click('.bk-cbtns [data-a=bkOpen]'); await rm.waitForTimeout(80);
  ok(!(await rm.$('.bk-leaf')) && (await ref(rm)) === '골로새서 1:13', 'reduced motion: opens without animation');
  await rm.click('[data-a=bkNext]'); await rm.waitForTimeout(80);
  ok(!(await rm.$('.bk-leaf')) && (await ref(rm)) === '골로새서 1:14', 'reduced motion: turns without animation');
  ok(await rm.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'fits a 360px phone');
  await shot(rm, 'b_small_page');

  ok(p.errs.length + pad.errs.length + rm.errs.length === 0, 'no script errors ' + JSON.stringify(p.errs.concat(pad.errs, rm.errs)));
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nBible storybook: all checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
