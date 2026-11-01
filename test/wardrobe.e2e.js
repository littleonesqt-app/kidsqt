/* Wardrobe: boys and girls get different clothes (boys never see a skirt), the Nov–Dec gift schedule, and the
   two-pick gift (gloves + hat). Pinned to Friday Dec 11 2026 (the 12월 2주 / week of Dec 7).
   node test/wardrobe.e2e.js http://localhost:3000     (also works on the demo file) */
const { chromium } = require('playwright');
const BASE = process.argv[2];
const FRI = new Date(2026, 11, 11, 10, 0, 0);
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(150); };

(async () => {
  const b = await chromium.launch();
  const ctx = await require('./_pin-date').context(await b.newContext({ viewport: { width: 390, height: 844 } }), FRI);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE); await p.waitForTimeout(600);
  if (await p.$('form[data-form=login]')) {
    const u = 'wd' + String(Date.now()).slice(-8);
    await p.click('[data-a=authMode][data-v=signup]');
    await p.fill('#f-username', u); await p.fill('#f-password', 'ward-robe1'); await p.fill('#f-password2', 'ward-robe1');
    await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
    await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]');
  }
  if (await p.$('[data-a=obNext]')) { await p.click('[data-a=obNext]'); await p.click('[data-a=start]'); }
  await p.waitForSelector('.daygrid');

  console.log('\nBoys and girls');
  const info = await p.evaluate(() => {
    const W = window.__wd, out = {};
    for (const g of ['boy', 'girl']) {
      W.setGender(g);
      out[g] = { bottoms: W.slotItems('bottom').map(i => i.type + ':' + i.id), all: W.SLOTS.map(s => W.slotItems(s).map(i => i.id)).flat() };
    }
    return out;
  });
  ok(info.boy.bottoms.every(x => !x.startsWith('skirt')), 'boys never get a skirt: ' + info.boy.bottoms.length + ' bottoms, none a skirt');
  ok(info.girl.bottoms.some(x => x.startsWith('skirt')), 'girls have skirts');
  ok(info.boy.all.every(id => !/skirt|^hd_bow$|^hd_flower$|ribbon|bunny|^s_mary$|^s_ballet$/.test(id)), 'boys do not get girl-only items (bow, flower clip, ribbon, ballet shoes…)');
  ok(info.girl.all.includes('p_wide') && !info.boy.all.includes('p_wide'), 'wide pants are girls only');
  ok(info.boy.all.includes('p_cord') && !info.girl.all.includes('p_cord'), 'corduroy pants are boys only');

  console.log('\nGift schedule');
  const sc = await p.evaluate(() => {
    const W = window.__wd, o = {};
    for (const g of ['boy', 'girl']) {
      W.setGender(g);
      for (const k of ['2026-10-26', '2026-11-2', '2026-11-9', '2026-11-16', '2026-11-23', '2026-11-30', '2026-12-7', '2026-12-14', '2026-12-21', '2026-12-28', '2027-1-4']) {
        const r = W.reward(k); o[g + k] = { cats: r.cats.map(c => c.slot), items: r.items, title: r.title };
      }
    }
    return o;
  });
  const first = (g, k) => sc[g + k].cats[0];
  for (const g of ['boy', 'girl']) {
    ok(first(g, '2026-11-2') === 'shoes' && sc[g + '2026-11-2'].items.includes('s_ugg'), g + ': 11/2 shoes incl. ugg boots');
    ok(first(g, '2026-11-9') === 'fa' && sc[g + '2026-11-9'].items.includes('a_glasses') && sc[g + '2026-11-9'].items.some(i => i === 'fa_phone'), g + ': 11/9 glasses + headbands');
    ok(first(g, '2026-11-16') === 'shirt' && sc[g + '2026-11-16'].items.every(i => i.startsWith('sw_')), g + ': 11/16 sweaters');
    ok(first(g, '2026-11-23') === 'bottom' && sc[g + '2026-11-23'].items.every(i => i.startsWith('p_')) && sc[g + '2026-11-23'].items.length >= 5, g + ': 11/23 long pants (' + sc[g + '2026-11-23'].items.length + ')');
    ok(sc[g + '2026-12-7'].cats.join() === 'glove,head', g + ': 12/7 gloves AND hat (pick two)');
    ok(first(g, '2026-12-14') === 'outer' && sc[g + '2026-12-14'].items.length >= 5, g + ': 12/14 ponchos');
    ok(first(g, '2026-12-21') === 'prop' && ['x_tree', 'x_sled', 'x_teddy'].every(i => sc[g + '2026-12-21'].items.includes(i)), g + ': 12/21 Christmas (tree, sled, teddy)');
    ok(first(g, '2026-12-28') === 'prop' && sc[g + '2026-12-28'].items.includes('k_skis'), g + ': 12/28 ski gear');
    ok(sc[g + '2027-1-4'].items.length > 0, g + ': gifts continue after the schedule');
  }
  ok(sc['boy2026-10-26'].items.every(i => !/skirt/.test(i)), 'boys: the Oct 26 pants-and-skirts gift has no skirts');

  console.log('\nTwo-pick gift (this week = Dec 7: gloves + hat)');
  await p.evaluate(() => { window.__wd.setGender('girl'); window.__wd.doneWeek(); });
  await navTo(p, 'profile');
  await p.click('[data-a=gift]'); await p.waitForSelector('#giftpick');
  const confirmOff = async () => (await p.getAttribute('[data-a=giftConfirm]', 'aria-disabled')) === 'true';
  ok(await confirmOff(), 'confirm is off before choosing');
  const tiles = await p.$$('#giftpick [data-a=giftSel]');
  ok(tiles.length >= 8, 'gloves and hats are offered together (' + tiles.length + ' tiles)');
  await p.click('#giftpick [data-a=giftSel][data-v=gl_red]');
  ok(await confirmOff(), 'still off with only the gloves chosen');
  await p.click('#giftpick [data-a=giftSel][data-v=hd_bunny]');
  ok(!(await confirmOff()), 'confirm turns on once a glove and a hat are chosen');
  await p.click('[data-a=giftConfirm]'); await p.waitForTimeout(250);
  ok(!(await p.$('#giftpick')), 'gift picker closes');
  await p.click('[data-a=setCat][data-v=glove]'); await p.waitForTimeout(150);
  ok((await p.$$('#wardrobe .tile:not(.locked)')).length === 2, 'gloves tab: bare hands + the chosen gloves are open, the rest locked');
  await p.click('[data-a=setCat][data-v=head]'); await p.waitForTimeout(150);
  ok(await p.$('#wardrobe [data-a=pickItem][data-v=hd_bunny]:not(.locked)') !== null, 'the chosen hat is open');
  ok(await p.$('#wardrobe [data-a=pickItem][data-v=hd_cat].locked') !== null, 'the other hats stay locked');
  console.log(fails || errs.length ? '\nFAILED' : '\nAll checks passed'); if (errs.length) console.log(errs);
  await b.close(); process.exit(fails || errs.length ? 1 : 0);
})();
