/* Drawing / handwriting on different phones: node test/ink-devices.e2e.js http://localhost:3000   (or the demo file)
   Real finger touches (CDP touch events, so the page sees pointerType "touch") on iPhone-sized screens.
   It covers what differs between phones and iOS versions: how wide the finger contact is reported, a pointer that is
   lost or cancelled mid-stroke, and a phone that never sends pointer events at all.
   Chromium stands in for Safari here, so this checks our code's input paths, not WebKit itself. */
const { chromium } = require('playwright');
const BASE = process.argv[2];
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const FRI = new Date(2026, 9, 23, 10, 0, 0); // #31, Monday's typed question is #3

const PHONES = [
  ['iPhone SE', 375, 667, 2], ['iPhone 13', 390, 844, 3], ['iPhone 15', 393, 852, 3],
  ['iPhone 16', 393, 852, 3], ['iPhone 16 Pro', 402, 874, 3], ['iPhone 15 Pro Max', 430, 932, 3]
];

async function open(b, [name, w, h, dpr], opts) {
  const ctx = await require('./_pin-date').context(await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, hasTouch: true, isMobile: true }), FRI);
  // the raw demo file has no viewport tag (the published page adds one), so a phone would lay it out 980px wide
  if (/^file:/.test(BASE)) await ctx.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const m = document.createElement('meta'); m.name = 'viewport'; m.content = 'width=device-width,initial-scale=1'; document.head.appendChild(m); }));
  if (opts && opts.noPointer) await ctx.addInitScript(() => ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => window.addEventListener(t, e => { if (e.target && e.target.tagName === 'CANVAS') e.stopImmediatePropagation(); }, true)));
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto(BASE); await p.waitForTimeout(500);
  if (await p.$('form[data-form=login]')) {
    const u = 'ik' + String(Date.now()).slice(-8) + Math.floor(Math.random() * 99);
    await p.click('[data-a=authMode][data-v=signup]');
    await p.fill('#f-username', u); await p.fill('#f-password', 'ink-device1'); await p.fill('#f-password2', 'ink-device1');
    await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
    await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]');
  }
  if (await p.$('[data-a=obNext]')) { await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); }
  await p.waitForSelector('.daygrid');
  await p.click('.daycard[data-v="2026-10-19"]'); await p.waitForSelector('#qcard-2');
  p.cdp = await ctx.newCDPSession(p);
  return p;
}
const openInk = async p => { await p.evaluate(() => document.querySelector('#qcard-2').scrollIntoView({ block: 'center' })); await p.click('#qcard-2 [data-a=qhand]'); await p.waitForSelector('.ink canvas'); await p.waitForTimeout(450); };
const box = async p => (await (await p.$('.ink canvas')).boundingBox());
const tp = (x, y, r) => ({ x, y, radiusX: r, radiusY: r, force: 0.5, id: 1 });
async function finger(p, r, n) { // one stroke with a finger whose contact radius is r CSS px
  const b = await box(p), x0 = b.x + 40, y0 = b.y + 110;
  await p.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [tp(x0, y0, r)] });
  for (let i = 1; i <= (n || 12); i++) await p.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [tp(x0 + i * 14, y0 + (i % 3) * 16, r)] });
  await p.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(80);
}
// save and see whether anything was kept: the answer's handwriting preview shows when at least one stroke was saved
async function saved(p) {
  const dirtyBtn = await p.$('[data-ik=undo]:not([disabled])');
  await p.click('[data-ik=save]'); await p.waitForTimeout(300);
  return { had: !!(await p.$('#qcard-2 .hwprev svg path')), canUndo: !!dirtyBtn };
}
async function reset(p) { // remove saved handwriting so the next scenario starts empty
  if (await p.$('#qcard-2 .hwprev')) { await p.click('#qcard-2 .hwprev'); await p.waitForSelector('.ink canvas'); await p.click('[data-ik=clear]'); await p.click('[data-ik=clearYes]'); await p.click('[data-ik=save]'); await p.waitForTimeout(250); }
}

(async () => {
  const b = await chromium.launch();

  for (const ph of PHONES) {
    console.log('\n' + ph[0] + ' (' + ph[1] + '×' + ph[2] + ' @' + ph[3] + 'x)');
    const p = await open(b, ph);
    await openInk(p);
    const bb = await box(p);
    ok(bb.width > 250 && bb.height > 250, 'the writing page has a real size (' + Math.round(bb.width) + '×' + Math.round(bb.height) + ')');
    await finger(p, 5); ok((await saved(p)).had, 'normal finger (contact ~10px wide) writes');
    await reset(p);
    await openInk(p); await finger(p, 30); ok((await saved(p)).had, 'wide finger contact (60px) writes — the case that used to be ignored');
    await reset(p);
    await openInk(p); await finger(p, 45); ok((await saved(p)).had, 'very wide finger contact (90px) writes');
    await reset(p);
    await openInk(p); await finger(p, 90); { const s = await saved(p); ok(!s.had, 'a whole palm (180px) is ignored'); }
    ok(p.errs.length === 0, 'no script errors ' + JSON.stringify(p.errs));
    await p.context().close();
  }

  console.log('\nA stroke that never ends (system gesture, lost pointer) does not block the next one');
  { const p = await open(b, PHONES[1]); await openInk(p);
    await p.evaluate(() => { const c = document.querySelector('.ink canvas'), r = c.getBoundingClientRect();
      c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 77, pointerType: 'touch', clientX: r.left + 80, clientY: r.top + 80, button: 0, bubbles: true, cancelable: true })); });
    await p.waitForTimeout(900);
    await finger(p, 5); ok((await saved(p)).had, 'the next touch still writes after 0.9s');
    await p.context().close(); }

  console.log('\nThe phone cancels the pointer in the middle of a stroke (iOS takes the touch for a gesture)');
  { const p = await open(b, PHONES[2]); await openInk(p);
    const bx = await box(p), x0 = bx.x + 40, y0 = bx.y + 110;
    await p.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [tp(x0, y0, 5)] });
    for (let i = 1; i <= 4; i++) await p.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [tp(x0 + i * 14, y0 + 10, 5)] });
    await p.evaluate(() => document.querySelector('.ink canvas').dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, pointerType: 'touch', bubbles: true })));
    for (let i = 5; i <= 14; i++) await p.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [tp(x0 + i * 14, y0 + 10 + (i % 3) * 12, 5)] });
    await p.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await p.waitForTimeout(100);
    ok((await saved(p)).had, 'writing continues and is saved');
    await p.context().close(); }

  console.log('\nA phone that never sends pointer events: touch events draw instead');
  { const p = await open(b, PHONES[3], { noPointer: true }); await openInk(p);
    await finger(p, 5, 14); ok((await saved(p)).had, 'touch-event fallback writes');
    ok(p.errs.length === 0, 'no script errors ' + JSON.stringify(p.errs));
    await p.context().close(); }

  console.log('\nDrawing question (#32 Monday) with a finger');
  { const ctx = await require('./_pin-date').context(await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true }), new Date(2026, 9, 30, 10, 0, 0));
    if (/^file:/.test(BASE)) await ctx.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const m = document.createElement('meta'); m.name = 'viewport'; m.content = 'width=device-width,initial-scale=1'; document.head.appendChild(m); }));
    const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); await p.goto(BASE); await p.waitForTimeout(500);
    if (await p.$('form[data-form=login]')) { const u = 'ik' + String(Date.now()).slice(-8) + 'd'; await p.click('[data-a=authMode][data-v=signup]'); await p.fill('#f-username', u); await p.fill('#f-password', 'ink-device1'); await p.fill('#f-password2', 'ink-device1'); await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode'); await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]'); }
    if (await p.$('[data-a=obNext]')) { await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); }
    await p.waitForSelector('.daygrid'); await p.click('.daycard[data-v="2026-10-26"]'); await p.waitForSelector('#qcard-0 .qdraw');
    p.cdp = await ctx.newCDPSession(p);
    await p.click('#qcard-0 .qdraw'); await p.waitForSelector('.ink canvas'); await p.waitForTimeout(450);
    await finger(p, 28); await p.click('[data-ik=save]'); await p.waitForTimeout(300);
    ok(!!(await p.$('#qcard-0 .qdraw.has svg path')), 'a finger drawing (wide contact) is saved');
    ok(p.errs.length === 0, 'no script errors ' + JSON.stringify(p.errs));
    await ctx.close(); }

  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nPhones: all checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
