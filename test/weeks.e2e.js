/* Weekly packs (#31 → #32), end to end: node test/weeks.e2e.js http://localhost:3000 [shots]
   The browser's calendar day is set to a day in the #32 week (and to the Sunday before it), so this test does not depend on today's date. */
const { chromium } = require('playwright');
const BASE = process.argv[2], OUT = process.argv[3] || '';
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: OUT + '/' + n + '.png' }); };
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(220); };
const text = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
const server = p => p.evaluate(() => fetch('/api/progress', { headers: { 'X-IAM-Client': '1' } }).then(r => r.json()).then(j => j.state));
const settle = p => p.waitForTimeout(950);
const TUE = new Date(2026, 9, 27, 10, 0, 0), SUN = new Date(2026, 9, 25, 19, 0, 0);

async function page(b, when, vp) {
  const ctx = await require('./_pin-date').context(await b.newContext({ viewport: vp || { width: 390, height: 844 } }), when);
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  return p;
}
async function signup(p) {
  const u = 'wk' + String(Date.now()).slice(-8) + Math.floor(Math.random() * 9);
  await p.goto(BASE); await p.waitForSelector('form[data-form=login]');
  await p.click('[data-a=authMode][data-v=signup]');
  await p.fill('#f-username', u); await p.fill('#f-password', 'weeks-pass1'); await p.fill('#f-password2', 'weeks-pass1');
  await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
  await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]'); await p.click('[data-a=obNext]'); await p.click('[data-a=start]');
  await p.waitForSelector('.daygrid'); p.user = u; return u;
}
async function draw(p) {
  const c = await p.$('.ink canvas'), b = await c.boundingBox();
  for (let k = 0; k < 2; k++) { await p.mouse.move(b.x + 60, b.y + 90 + k * 60); await p.mouse.down(); for (let i = 1; i <= 14; i++) await p.mouse.move(b.x + 60 + i * 15, b.y + 90 + k * 60 + (i % 2) * 20); await p.mouse.up(); }
}

(async () => {
  const b = await chromium.launch();

  console.log('\n#32 week (Tuesday Oct 27)');
  const p = await page(b, TUE);
  await signup(p);
  await require('./_admin')(p, p.user); await p.waitForSelector('.daygrid');   // opens Thursday from the calendar later
  ok((await text(p, 'main')).includes('Little ones QT · 10월 4주'), 'header says 10월 4주');
  ok((await text(p, '.wksw')).includes('10월 3주 · 지난 주') && (await text(p, '.wkcur')) === '10월 4주 · 이번 주' && !(await p.$('.wkb.nx')), 'switcher: ‹ 10월 3주 · 지난 주 · 10월 4주 · 이번 주, no next week yet');
  const vc = await text(p, '.versecard');
  ok(vc.includes('이번 주 말씀 · 빌레몬서 1:10-18') && vc.includes('사랑받는 형제') && vc.includes('A Beloved Brother') && vc.includes('10 갇힌 중에서'), 'verse card shows Philemon 1:10-18, “사랑받는 형제”, starting at verse 10');
  const mc = await text(p, '.memcard');
  ok(mc.includes('빌레몬서 1:16상') && mc.includes('종 이상으로 곧 사랑 받는 형제로 둘 자라') && mc.includes('Philemon 1:16a'), 'memory card shows Philemon 1:16a');
  const cards = await p.$$eval('.daycard .dc-title', e => e.map(x => x.textContent));
  ok(cards.join(',') === '마음 열기,말씀 찾기,숨은 이야기,하나님 마음,내 삶으로', 'five day cards');
  await shot(p, 'w_home32');

  console.log('\nBible storybook #32');
  await navTo(p, 'bible');
  ok((await text(p, 'main h1')) === '이번 주 성경 읽기' && (await text(p, 'main .chip')).startsWith('10월 4주 · 이번 주'), 'Bible header 10월 4주 · 이번 주');
  ok((await text(p, '.bk-closed')).includes('사랑받는 형제') && (await text(p, '.bk-closed')).includes('빌레몬서 1:10-18'), 'cover: 사랑받는 형제 · 빌레몬서 1:10-18');
  ok(!!(await p.$('.bk-closed svg[role=img][aria-label*="편지"]')), 'cover has the letter illustration');
  await shot(p, 'w_cover32');
  await p.click('.bk-cbtns [data-a=bkOpen]'); await settle(p);
  ok((await text(p, '#bkpages .bk-page.r .bk-ref')) === '빌레몬서 1:10' && (await text(p, '.bk-pnum')) === '1 / 9 절', 'opens on 빌레몬서 1:10, 1 / 9 절');
  for (let i = 0; i < 6; i++) { await p.click('#bknext'); await settle(p); }
  ok((await text(p, '#bkpages .bk-page.r .bk-ref')) === '빌레몬서 1:16' && (await text(p, '#bkpages .bk-page.r')).includes('이번 주 암송 구절'), 'verse 16 is marked as the memory verse');
  await shot(p, 'w_page16');

  console.log('\nTuesday QT #32');
  await navTo(p, 'home'); await p.click('.daycard.today'); await p.waitForTimeout(250);
  ok((await text(p, 'main h1')).includes('말씀 찾기') && (await p.$$('section[id^=qcard-]')).length === 4, 'Tuesday has 4 questions');
  await p.click('#qcard-0 .vref'); await p.waitForTimeout(150);
  ok((await text(p, '#vpop')).includes('빌레몬서 1:10') && (await text(p, '#vpop')).includes('갇힌 중에서 낳은 아들 오네시모를 위하여'), '“10절” opens Philemon 1:10');
  await p.click('#vpop .vclose'); await p.waitForTimeout(100);
  await p.click('[data-a=qs][data-v="0:1"]');
  await p.click('[data-a=qg][data-v="1:0:0"]'); await p.click('[data-a=qg][data-v="1:1:1"]');
  await p.click('[data-a=qs][data-v="2:1"]');
  await p.fill('#qt-3', '그것을 내 앞으로 계산하라'); await p.locator('#qt-3').blur(); await p.waitForTimeout(150);
  await p.evaluate(() => { const t = document.getElementById('qt-3'); t.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.waitForTimeout(200);
  ok(await p.$$eval('.donecheck:not([hidden])', e => e.length) >= 4, 'all four answered');
  if (!(await p.$('.overlay'))) { await p.click('[data-a=finish]'); await p.waitForTimeout(150); if (await p.$('[data-a=finish][data-v=force]')) await p.click('[data-a=finish][data-v=force]'); }
  await p.waitForTimeout(400);
  ok(!!(await p.$('.overlay .dialog')), 'Tuesday done: celebration');
  await p.click('[data-a=celClose]').catch(() => {}); await p.waitForTimeout(200);

  console.log('\nMonday QT #32 · drawing');
  await navTo(p, 'home'); await p.click('.daycard >> nth=0'); await p.waitForTimeout(250);
  ok((await text(p, 'main h1')).includes('마음 열기') && !!(await p.$('#qcard-0 .qdraw')), 'Monday starts with a drawing question');
  ok((await text(p, '#qcard-0')).includes('바울이 편지를 쓰는 모습을 상상해 그림으로 그려 보세요'), 'drawing prompt from the workbook');
  ok(!!(await p.$('#qt-2.bubble')), 'question 3 is a speech bubble');
  await shot(p, 'w_mon_before');
  await p.click('#qcard-0 .qdraw'); await p.waitForSelector('.ink');
  ok((await text(p, '.ink-hint')) === '바울이 편지를 쓰는 모습을 그려 보세요' && (await text(p, '.ink-top')).includes('그림 그리기'), 'notebook opens as a drawing page');
  await draw(p); await shot(p, 'w_drawing');
  await p.click('[data-ik=save]'); await p.waitForTimeout(300);
  ok(!(await p.$('.ink')) && !!(await p.$('#qcard-0 .qdraw.has svg path')) && !(await p.$eval('#qchk-0', e => e.hidden)), 'drawing saved, shows in the card, question done');
  await p.click('[data-a=qs][data-v="1:2"]');
  await p.fill('#qt-2', '돌아와서 미안해요. 다시 받아 주세요.'); await p.evaluate(() => document.getElementById('qt-2').dispatchEvent(new Event('input', { bubbles: true })));
  await p.click('[data-a=qs][data-v="3:0"]'); await p.waitForTimeout(400);
  if (!(await p.$('.overlay'))) { await p.click('[data-a=finish]'); await p.waitForTimeout(150); if (await p.$('[data-a=finish][data-v=force]')) await p.click('[data-a=finish][data-v=force]'); }
  ok(!!(await p.$('.overlay .dialog')), 'Monday done: celebration');
  await p.click('[data-a=celClose]').catch(() => {}); await p.waitForTimeout(1600);
  let st = await server(p);
  ok(st.days['2026-10-26'] && st.days['2026-10-27'], 'Mon 10/26 and Tue 10/27 saved as done');
  ok(Array.isArray(st.qink['2026-10-26-0']) && st.qink['2026-10-26-0'].length === 2, 'drawing saved to the account (2 strokes)');
  await shot(p, 'w_mon_after');

  console.log('\nThursday QT #32 (preview from the calendar)');
  await navTo(p, 'home'); await p.click('[data-a=go][data-v=calendar]'); await p.waitForTimeout(200);
  await p.click('[data-a=demoDay][data-v="2026-10-29"]'); await p.waitForTimeout(250);
  ok((await text(p, 'main h1')).includes('하나님 마음'), 'Thursday lesson');
  await p.click('#qcard-1 .vref'); await p.waitForTimeout(150);
  ok((await text(p, '#vtitle')) === '갈라디아서 3:28' && (await text(p, '#vpop')).includes('다 그리스도 예수 안에서 하나이니라'), '“갈 3:28” opens Galatians 3:28');
  await p.click('#vpop .vclose'); await p.waitForTimeout(100);
  const refs = await p.$$eval('#qcard-2 .vref', e => e.map(x => x.textContent.trim()));
  ok(refs.join('|') === '몬 1:18|고전 15:3', 'two references in question 3 are both links');
  await p.click('#qcard-2 .vref >> nth=1'); await p.waitForTimeout(150);
  ok((await text(p, '#vpop')).includes('그리스도께서 우리 죄를 위하여 죽으시고'), '“고전 15:3” opens 1 Corinthians 15:3');
  await p.click('#vpop .vclose'); await p.waitForTimeout(100);
  await p.click('[data-a=qw][data-v="0:0"]');
  await p.click('[data-a=qs][data-v="1:1"]');
  await p.click('[data-a=qw][data-v="2:0"]'); await p.click('[data-a=qw][data-v="2:1"]');
  await p.fill('#qt-3', '서로 사랑하는 형제로 대해요'); await p.evaluate(() => document.getElementById('qt-3').dispatchEvent(new Event('input', { bubbles: true })));
  await p.waitForTimeout(300);
  ok(await p.$$eval('.donecheck:not([hidden])', e => e.length) >= 4, 'Thursday: all four answered');
  if (!(await p.$('.overlay'))) { await p.click('[data-a=finish]'); await p.waitForTimeout(150); if (await p.$('[data-a=finish][data-v=force]')) await p.click('[data-a=finish][data-v=force]'); }
  await p.waitForTimeout(400);
  ok(!!(await p.$('.overlay .dialog')), 'Thursday done');
  await p.click('[data-a=celClose]').catch(() => {}); await p.waitForTimeout(200);

  console.log('\nParent guide #32');
  await navTo(p, 'parent');
  ok((await text(p, '.ptitle')).includes('10월 4주 · 빌레몬서 1:10-18'), 'parent header #32');
  ok((await text(p, '.pcard.big')).includes('사랑받는 형제'), 'week card “사랑받는 형제”');
  await p.click('.pcard.big'); await p.waitForTimeout(250);
  const wk = await text(p, '.ppanel');
  ok(wk.includes('부모님이 기억해야 할 세 가지 신학적 관점') && wk.includes('첫째, 용서는 잘못을 없었던 일로 만드는 것이 아닙니다.'), 'three theological truths');
  ok(wk.includes('한 주간 묵상을 마무리하며') && wk.includes('다른 사람을 바라보는 내 마음은 어떻게 달라질 수 있을까') && wk.includes('이번 주의 핵심 메시지'), 'closing, question and key message');
  await shot(p, 'w_pg_week');
  await p.click('[data-a=go][data-v=parent] >> nth=-1'); await p.waitForTimeout(150);
  await p.click('.pcard[data-v=mon]'); await p.waitForTimeout(200);
  const mon = await text(p, '.ppanel');
  ok(mon.includes('바울이 보낸 특별한 편지') && mon.includes('부모님을 위한 신학적 통찰') && mon.includes('성경 해석은 오늘날'), 'Monday guide with its theological insight');
  await shot(p, 'w_pg_mon');

  console.log('\nMemory practice #32');
  await navTo(p, 'home'); await p.click('.memcard [data-a=memOpen]'); await p.waitForSelector('.mempage');
  ok((await text(p, '.mempage .meta')).includes('빌레몬서 1:16상'), 'memory practice uses Philemon 1:16a');
  await p.click('[data-a=memDay][data-v=thu]'); await p.waitForTimeout(150);
  ok((await p.$$('.mbank .mblk')).length === 14, '14 word blocks for Thursday');
  await p.click('#backfix .backbtn'); await p.waitForTimeout(200);

  console.log('\nLooking back at last week (#31)');
  await p.click('.wkb'); await p.waitForTimeout(250);
  ok((await text(p, '.wkcur')) === '10월 3주 · 지난 주' && !!(await p.$('.wkb.nx')), 'switched to 10월 3주 · 지난 주, can go forward again');
  const vc31 = await text(p, '.versecard');
  ok(vc31.includes('지난 주 말씀 · 골로새서 1:13-20') && vc31.includes('예수님이 누구신지 바로 알아야 해요!'), 'last week’s verse card is #31 Colossians');
  ok((await text(p, 'main .meta')).includes('10월 3주'), 'header shows 10월 3주');
  await shot(p, 'w_home31');
  await p.click('.daycard >> nth=0'); await p.waitForTimeout(250);
  ok((await text(p, 'main h1')).includes('마음 열기') && (await text(p, '#qcard-0')).includes('예수님을 생각하면'), 'last week’s Monday opens the #31 lesson');
  await p.click('#backfix .backbtn'); await p.waitForTimeout(200);
  ok((await text(p, '.wkcur')) === '10월 3주 · 지난 주', 'still looking at last week after coming back');
  await navTo(p, 'bible');
  ok((await text(p, 'main .chip')).startsWith('10월 3주 · 지난 주') && !!(await p.$('.wkback')) && (await text(p, 'main h1')) === '지난 주 성경 읽기', 'Bible: 10월 3주 · 지난 주 with a way back');
  ok((await text(p, '.bk-closed')).includes('예수님이 누구신지 바로 알아야 해요!'), 'last week’s storybook cover');
  await navTo(p, 'thanks');
  ok((await text(p, 'main')).includes('10월 3주 · 지난 주') && !!(await p.$('.wkback')), 'Thanks shows which week');
  await p.click('.wkback'); await p.waitForTimeout(200);
  ok(!(await p.$('.wkback')), 'back to this week');
  await navTo(p, 'home');
  ok((await text(p, '.wkcur')) === '10월 4주 · 이번 주', 'home is #32 again');

  console.log('\nEnglish');
  await p.click('[data-a=setLang][data-v=en]'); await p.waitForTimeout(200);
  const vce = await text(p, '.versecard');
  ok(vce.includes("This Week's Bible · Philemon 1:10–18") && vce.includes('A Beloved Brother'), 'English verse card');
  ok((await text(p, '.wkcur')) === 'Oct · Week 4 · This Week' && (await text(p, '.wkb')).includes('Oct · Week 3 · Last Week'), 'English switcher');
  await p.click('.daycard >> nth=1'); await p.waitForTimeout(250);
  ok((await text(p, '#qcard-0')).includes('Choose · v. 10'), 'English label “Choose · v. 10”');
  await p.click('#qcard-0 .vref'); await p.waitForTimeout(150);
  ok((await text(p, '#vtitle')) === 'Philemon 1:10' && (await text(p, '#vpop')).includes('I appeal to you for my child, Onesimus'), 'ESV Philemon 1:10');
  await p.click('#vpop .vclose'); await p.waitForTimeout(100);
  await shot(p, 'w_en_quiz');
  await p.click('#backfix .backbtn'); await p.waitForTimeout(150);
  await p.click('[data-a=setLang][data-v=ko]'); await p.waitForTimeout(150);

  console.log('\nSecond device');
  const pc = await page(b, TUE, { width: 1180, height: 820 });
  await pc.goto(BASE); await pc.waitForSelector('form[data-form=login]');
  await pc.fill('#f-username', p.user); await pc.fill('#f-password', 'weeks-pass1'); await pc.click('form[data-form=login] button[type=submit]');
  await pc.waitForSelector('.daygrid'); await pc.click('.daycard >> nth=0'); await pc.waitForTimeout(400);
  ok(!!(await pc.$('#qcard-0 .qdraw.has svg path')), 'the iPad shows the Monday drawing');

  console.log('\nSunday before (#31 week): preview next week');
  const ps = await page(b, SUN);
  await signup(ps);
  ok(!(await ps.$('.wkb.nx')), 'Sunday, child account: no next-week preview');
  await require('./_admin')(ps, ps.user); await ps.waitForSelector('.daygrid');
  ok((await text(ps, '.wkcur')) === '10월 3주 · 이번 주' && (await text(ps, '.wkb.nx')).includes('10월 4주 · 다음 주'), 'Sunday, admin: #31 this week, #32 next week to preview');
  await ps.click('.wkb.nx'); await ps.waitForTimeout(250);
  ok((await text(ps, '.wkcur')) === '10월 4주 · 다음 주' && (await text(ps, '.versecard')).includes('다음 주 말씀 · 빌레몬서 1:10-18'), 'preview shows #32');
  await ps.click('.daycard >> nth=0'); await ps.waitForTimeout(250);
  ok((await text(ps, 'main')).includes('관리자 미리 보기 · 10월'), 'admin can open next week’s Monday QT (marked as preview)');
  await shot(ps, 'w_preview');

  const errs = p.errs.concat(pc.errs, ps.errs);
  ok(errs.length === 0, 'no script errors ' + JSON.stringify(errs));
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nWeeks: all checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
