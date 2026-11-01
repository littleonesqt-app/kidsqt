/* Days open on their own date: a child can open today and past days, not days that haven't come yet.
   An admin account can preview them (and turn the preview off to see the child's view).
   DATA_DIR=<test server data> node test/day-lock.e2e.js http://localhost:3000 [shots] */
const { chromium } = require('playwright');
const makeAdmin = require('./_admin');
const BASE = process.argv[2], OUT = process.argv[3] || '';
const WED = new Date(2026, 9, 28, 10, 0, 0);   // #32 week: Mon 10/26, Tue 10/27 past · Wed today · Thu, Fri later
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const text = async (p, s) => ((await p.textContent(s)) || '').replace(/\s+/g, ' ').trim();
const navTo = async (p, v) => { await p.evaluate(v => document.querySelector('nav [data-v="' + v + '"]').click(), v); await p.waitForTimeout(150); };
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: `${OUT}/${n}.png` }); };
const toast = async p => { await p.waitForTimeout(120); const t = await p.$('.toast'); return t ? (await t.textContent()) : ''; };

(async () => {
  const b = await chromium.launch();
  const ctx = await require('./_pin-date').context(await b.newContext({ viewport: { width: 390, height: 844 } }), WED);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const user = 'dl' + String(Date.now()).slice(-8);
  await p.goto(BASE); await p.waitForSelector('form[data-form=login]');
  await p.click('[data-a=authMode][data-v=signup]');
  await p.fill('#f-username', user); await p.fill('#f-password', 'daylock-1'); await p.fill('#f-password2', 'daylock-1');
  await p.click('form[data-form=signup] button[type=submit]'); await p.waitForSelector('.rcode');
  await p.click('[data-a=rcAck]'); await p.click('[data-a=rcDone]'); await p.click('[data-a=obNext]'); await p.click('[data-a=start]');
  await p.waitForSelector('.daygrid');

  console.log('\nChild account on Wednesday');
  const me = await p.evaluate(() => fetch('/api/auth/me', { headers: { 'X-IAM-Client': '1' } }).then(r => r.json()));
  ok(me.user && me.user.admin === undefined, 'server: a normal account is not an admin');
  const locks = await p.$$eval('.daycard', e => e.map(x => !!x.querySelector('.lockb')));
  ok(JSON.stringify(locks) === '[false,false,false,true,true]', 'Home: Thursday and Friday show a lock, Mon–Wed do not');
  await shot(p, 'dl_home_child');
  await p.click('.daycard[data-v="2026-10-29"]');
  ok((await toast(p)).includes('아직 열리지 않았어요'), 'Thursday QT does not open (see you that day)');
  ok(await p.evaluate(() => document.querySelector('.daycard') && !document.querySelector('.qcard,#qcard-0')), 'still on Home');
  await p.click('.daycard[data-v="2026-10-26"]'); await p.waitForTimeout(250);
  ok(!!(await p.$('#qcard-0')) && (await text(p, 'main')).includes('큐티로 기록돼요'), 'Monday (past) opens any time');
  await navTo(p, 'home'); await p.click('.daycard[data-v="2026-10-28"]'); await p.waitForTimeout(250);
  ok(!!(await p.$('#qcard-0')), 'today opens');
  await navTo(p, 'home'); await p.click('[data-a=go][data-v=calendar]'); await p.waitForTimeout(200);
  ok(!(await p.$('[data-a=demoDay]')), 'Calendar: no “other days” panel for children');
  await navTo(p, 'home'); await p.click('.memcard [data-a=memOpen]'); await p.waitForSelector('.mempage');
  const mt = await p.$$eval('.mtab', e => e.map(x => x.classList.contains('locked')));
  ok(JSON.stringify(mt) === '[false,false,false,true,true]', 'Memory practice: Thu and Fri tabs locked');
  await p.click('[data-a=memDay][data-v=thu]');
  ok((await toast(p)).includes('아직 열리지 않았어요') && (await p.getAttribute('.mtab.on', 'data-v')) === 'wed', 'locked tab stays on Wednesday');
  await p.click('[data-a=memDay][data-v=mon]'); await p.waitForTimeout(150);
  ok((await p.getAttribute('.mtab.on', 'data-v')) === 'mon', 'Monday practice opens');
  await shot(p, 'dl_memory_child');
  await p.click('#backfix .backbtn'); await p.waitForTimeout(150);
  await navTo(p, 'thanks');
  ok(await p.$$eval('.nlock', e => e.length) === 2 && !(await p.$('[data-note$="-thu"]')) && !!(await p.$('[data-note$="-mon"]')), 'Thank-you notes: Thu/Fri wait for their day, Mon can be written');
  await shot(p, 'dl_thanks_child');
  await navTo(p, 'profile');
  ok(!(await p.$('#admincard')), 'no admin card on a child profile');

  console.log('\nThe same account made an admin');
  await makeAdmin(p, user); await p.waitForSelector('nav');
  const me2 = await p.evaluate(() => fetch('/api/auth/me', { headers: { 'X-IAM-Client': '1' } }).then(r => r.json()));
  ok(me2.user.admin === true, 'server: /auth/me says admin');
  await navTo(p, 'profile');
  ok((await text(p, '#admincard')).includes('켜짐'), 'Profile: admin preview card, on');
  await shot(p, 'dl_admincard');
  await navTo(p, 'home');
  ok(!(await p.$('.daycard .lockb')), 'Home: no locks');
  await p.click('.daycard[data-v="2026-10-29"]'); await p.waitForTimeout(250);
  ok(!!(await p.$('#qcard-0')) && (await text(p, 'main')).includes('관리자 미리 보기 · 10월'), 'Thursday QT opens as a preview');
  await shot(p, 'dl_quiz_admin');
  await navTo(p, 'home'); await p.click('[data-a=go][data-v=calendar]'); await p.waitForTimeout(200);
  ok((await p.$$eval('[data-a=demoDay]', e => e.length)) >= 2 && (await text(p, 'main')).includes('관리자 미리 보기'), 'Calendar: admin panel for other days');
  await navTo(p, 'thanks');
  ok(!(await p.$('.nlock')), 'Thank-you notes: all open');

  console.log('\nAdmin turns the preview off');
  await navTo(p, 'profile'); await p.click('[data-a=adminPv]'); await p.waitForTimeout(150);
  ok((await text(p, '#admincard')).includes('꺼짐'), 'preview off');
  await navTo(p, 'home');
  ok(await p.$$eval('.daycard .lockb', e => e.length) === 2, 'child view again: Thu/Fri locked');
  await p.reload(); await p.waitForSelector('nav');
  ok(await p.$$eval('.daycard .lockb', e => e.length) === 2, 'the choice is remembered on this device');
  await navTo(p, 'profile'); await p.click('[data-a=setLang][data-v=en]'); await p.waitForTimeout(150);
  const en = await text(p, '#admincard');
  ok(en.includes('Admin preview') && en.includes('Off') && !/[가-힣]/.test(en), 'English admin card');
  await p.click('[data-a=adminPv]'); await p.waitForTimeout(150);
  ok((await text(p, '#admincard')).includes('On'), 'turned back on');

  ok(errs.length === 0, 'no script errors ' + JSON.stringify(errs));
  await b.close();
  console.log(fails ? '\n' + fails + ' FAILED' : '\nDay lock: all checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
