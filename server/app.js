'use strict';
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const { openDb } = require('./db');
const A = require('./auth');
const P = require('./progress');

function createApp(cfg) {
  cfg = Object.assign({
    dataDir: path.join(__dirname, '..', 'data'),
    publicDir: path.join(__dirname, '..', 'public'),
    cookieSecure: true,
    trustProxy: false,
    sessionDays: 90,
    minPasswordLength: 6,
    allowedOrigins: [],
    /* per network address; a whole Sunday-school class may share one church Wi-Fi address, so these are generous.
       Each username also gets its own lockout after repeated wrong passwords. */
    signupPerHour: 60,
    loginPer15Min: 300
  }, cfg || {});

  const store = openDb(cfg.dataDir);
  const { q, tx } = store;
  const limiter = new A.Limiter();
  const COOKIE = cfg.cookieSecure ? '__Host-iamkids_sid' : 'iamkids_sid';
  const SESSION_MS = cfg.sessionDays * 24 * 60 * 60 * 1000;

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', cfg.trustProxy);

  /* ---------- security headers ---------- */
  app.use((req, res, next) => {
    res.set({
      'Content-Security-Policy': [
        "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com", "img-src 'self' data: blob:", "media-src 'self' blob:", "connect-src 'self'",
        "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'"
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), payment=()',   // microphone: memory-verse recordings
      'Cross-Origin-Opener-Policy': 'same-origin'
    });
    if (cfg.cookieSecure) res.set('Strict-Transport-Security', 'max-age=31536000');
    next();
  });

  app.get('/healthz', (req, res) => res.json({ ok: true }));

  /* ---------- API ---------- */
  const api = express.Router();
  api.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  api.use(express.json({ limit: '4mb', strict: true }));

  /* Changes must come from this app's own pages: custom header (cross-site pages can't send it without CORS,
     which this server never allows) + matching Origin when the browser sends one. */
  api.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') return next();
    if (req.get('x-iam-client') !== '1') return err(res, 403, 'origin_forbidden');
    const origin = req.get('origin');
    if (origin) {
      let host = '';
      try { host = new URL(origin).host; } catch (_) {}
      if (host !== req.get('host') && cfg.allowedOrigins.indexOf(origin) < 0) return err(res, 403, 'origin_forbidden');
    }
    next();
  });

  /* attach the signed-in user (if any); slide the session forward at most twice a day */
  api.use((req, res, next) => {
    const tok = readCookie(req, COOKIE);
    if (!tok || tok.length > 100) return next();
    const h = A.tokenHash(tok);
    const s = q.sessionByHash.get(h);
    const now = Date.now();
    if (!s) return next();
    if (s.expires_at < now) { q.deleteSession.run(h); return next(); }
    const u = q.userById.get(s.user_id);
    if (!u) return next();
    req.user = u; req.sessionHash = h;
    if (now - s.last_seen > 12 * 60 * 60 * 1000) {
      q.touchSession.run(now + SESSION_MS, now, h);
      setCookie(res, tok);
    }
    next();
  });
  const needAuth = (req, res, next) => req.user ? next() : err(res, 401, 'not_authenticated');

  function startSession(res, userId) {
    const tok = A.newToken(), now = Date.now();
    q.insertSession.run(A.tokenHash(tok), userId, now, now + SESSION_MS, now);
    setCookie(res, tok);
    return A.tokenHash(tok);
  }
  function setCookie(res, tok) {
    res.cookie(COOKIE, tok, { httpOnly: true, secure: cfg.cookieSecure, sameSite: 'lax', path: '/', maxAge: SESSION_MS });
  }
  function clearCookie(res) { res.clearCookie(COOKIE, { httpOnly: true, secure: cfg.cookieSecure, sameSite: 'lax', path: '/' }); }
  const publicUser = u => (u.is_admin ? { id: u.id, username: u.username, admin: true } : { id: u.id, username: u.username });
  const limited = (res, sec) => err(res, 429, 'rate_limited', { retryAfter: sec });

  api.get('/auth/username-available', (req, res) => {
    const wait = limiter.hit('avail:' + req.ip, 60, 60 * 1000);
    if (wait) return limited(res, wait);
    const c = A.checkUsername(req.query.u);
    if (c.error) return res.json({ available: false, reason: c.error });
    const taken = !!q.userByName.get(c.username);
    res.json({ available: !taken, reason: taken ? 'username_taken' : null });
  });

  api.post('/auth/signup', wrap(async (req, res) => {
    const wait = limiter.hit('signup:' + req.ip, cfg.signupPerHour, 60 * 60 * 1000);
    if (wait) return limited(res, wait);
    const b = req.body || {};
    const c = A.checkUsername(b.username);
    if (c.error) return err(res, 400, c.error);
    const pe = A.checkPassword(b.password, c.username, cfg.minPasswordLength);
    if (pe) return err(res, 400, pe);
    if (q.userByName.get(c.username)) return err(res, 409, 'username_taken');
    const code = A.newRecoveryCode();
    const [pwHash, rcHash] = await Promise.all([A.hashSecret(b.password), A.hashSecret(A.normCode(code))]);
    const id = crypto.randomUUID(), now = Date.now();
    const lang = b.lang === 'en' ? 'en' : 'ko';
    try {
      tx(() => {
        if (q.userByName.get(c.username)) throw Object.assign(new Error('taken'), { code: 'taken' });
        q.insertUser.run(id, c.username, pwHash, rcHash, now, now);
        q.insertProgress.run(id, JSON.stringify(P.defaults(lang)), JSON.stringify({ lang: now }), 1, now);
      });
    } catch (e) {
      if (e.code === 'taken' || /UNIQUE/.test(String(e.message))) return err(res, 409, 'username_taken');
      throw e;
    }
    startSession(res, id);
    res.status(201).json({ user: { id, username: c.username }, recoveryCode: code });
  }));

  api.post('/auth/login', wrap(async (req, res) => {
    const wait = limiter.hit('login:' + req.ip, cfg.loginPer15Min, 15 * 60 * 1000);
    if (wait) return limited(res, wait);
    const b = req.body || {};
    const uname = String(b.username || '').trim().toLowerCase().slice(0, 40);
    const pw = typeof b.password === 'string' ? b.password.slice(0, 200) : '';
    const lk = 'login:u:' + uname;
    const locked = limiter.lockedFor(lk);
    if (locked) return limited(res, locked);
    const u = uname ? q.userByName.get(uname) : null;
    const ok = u ? await A.verifySecret(u.pw_hash, pw) : await A.dummyVerify(pw);
    if (!ok) { limiter.fail(lk); return err(res, 401, 'credentials_invalid'); }
    limiter.ok(lk);
    startSession(res, u.id);
    res.json({ user: publicUser(u) });
  }));

  api.post('/auth/logout', (req, res) => {
    if (req.sessionHash) q.deleteSession.run(req.sessionHash);
    clearCookie(res);
    res.json({ ok: true });
  });

  api.get('/auth/me', needAuth, (req, res) => res.json({ user: publicUser(req.user) }));

  api.post('/auth/change-password', needAuth, wrap(async (req, res) => {
    const b = req.body || {};
    const lk = 'pw:' + req.user.id;
    const locked = limiter.lockedFor(lk);
    if (locked) return limited(res, locked);
    if (!(await A.verifySecret(req.user.pw_hash, String(b.current || '')))) { limiter.fail(lk); return err(res, 401, 'current_password_wrong'); }
    limiter.ok(lk);
    const pe = A.checkPassword(b.next, req.user.username, cfg.minPasswordLength);
    if (pe) return err(res, 400, pe);
    const h = await A.hashSecret(b.next);
    q.setPassword.run(h, Date.now(), req.user.id);
    q.deleteOtherSessions.run(req.user.id, req.sessionHash);   // other devices must sign in again with the new password
    res.json({ ok: true });
  }));

  api.post('/auth/recovery-code', needAuth, wrap(async (req, res) => {
    const lk = 'pw:' + req.user.id;
    const locked = limiter.lockedFor(lk);
    if (locked) return limited(res, locked);
    if (!(await A.verifySecret(req.user.pw_hash, String((req.body || {}).password || '')))) { limiter.fail(lk); return err(res, 401, 'current_password_wrong'); }
    limiter.ok(lk);
    const code = A.newRecoveryCode();
    q.setRecovery.run(await A.hashSecret(A.normCode(code)), Date.now(), req.user.id);
    res.json({ recoveryCode: code });
  }));

  api.post('/auth/recover', wrap(async (req, res) => {
    const wait = limiter.hit('recover:' + req.ip, 30, 15 * 60 * 1000);
    if (wait) return limited(res, wait);
    const b = req.body || {};
    const uname = String(b.username || '').trim().toLowerCase().slice(0, 40);
    const lk = 'recover:u:' + uname;
    const locked = limiter.lockedFor(lk);
    if (locked) return limited(res, locked);
    const pe = A.checkPassword(b.newPassword, uname, cfg.minPasswordLength);
    if (pe) return err(res, 400, pe);
    const u = uname ? q.userByName.get(uname) : null;
    const code = A.normCode(b.code);
    const ok = u && u.recovery_hash && code.length === 12 ? await A.verifySecret(u.recovery_hash, code) : await A.dummyVerify(code);
    if (!ok) { limiter.fail(lk); return err(res, 401, 'recovery_invalid'); }
    limiter.ok(lk); limiter.ok('login:u:' + uname);
    const next = A.newRecoveryCode();               // a recovery code works once; a new one replaces it
    const [pwHash, rcHash] = await Promise.all([A.hashSecret(b.newPassword), A.hashSecret(A.normCode(next))]);
    const now = Date.now();
    tx(() => {
      q.setPassword.run(pwHash, now, u.id);
      q.setRecovery.run(rcHash, now, u.id);
      q.deleteUserSessions.run(u.id);
    });
    startSession(res, u.id);
    res.json({ user: publicUser(u), recoveryCode: next });
  }));

  api.delete('/account', needAuth, wrap(async (req, res) => {
    const lk = 'pw:' + req.user.id;
    const locked = limiter.lockedFor(lk);
    if (locked) return limited(res, locked);
    if (!(await A.verifySecret(req.user.pw_hash, String((req.body || {}).password || '')))) { limiter.fail(lk); return err(res, 401, 'current_password_wrong'); }
    q.deleteUser.run(req.user.id);               // sessions and progress go with it (ON DELETE CASCADE)
    clearCookie(res);
    res.json({ ok: true });
  }));

  /* ---------- progress ---------- */
  function readProgress(uid) {
    const row = q.progressByUser.get(uid);
    if (!row) return { state: P.defaults('ko'), stamps: {}, version: 0, missing: true };
    return { state: P.normalize(JSON.parse(row.state)), stamps: JSON.parse(row.stamps), version: row.version };
  }
  function saveOps(uid, ops, opts) {
    return tx(() => {
      const cur = readProgress(uid);
      const r = P.applyOps(cur.state, cur.stamps, ops, Date.now(), opts);
      if (r.changed || cur.missing) {
        if (!P.sizeOk(cur.state)) { const e = new Error('too big'); e.status = 413; e.code = 'payload_too_large'; throw e; }
        const v = cur.version + 1, now = Date.now();
        if (cur.missing) q.insertProgress.run(uid, JSON.stringify(cur.state), JSON.stringify(cur.stamps), v, now);
        else q.updateProgress.run(JSON.stringify(cur.state), JSON.stringify(cur.stamps), v, now, uid);
        cur.version = v;
      }
      return { state: cur.state, version: cur.version, rejected: r.rejected };
    });
  }

  api.get('/progress', needAuth, (req, res) => {
    const cur = readProgress(req.user.id);
    if (req.query.v && Number(req.query.v) === cur.version) return res.json({ unchanged: true, version: cur.version });
    res.json({ state: cur.state, version: cur.version });
  });

  api.post('/progress/patch', needAuth, (req, res) => {
    const wait = limiter.hit('patch:' + req.user.id, 300, 60 * 1000);
    if (wait) return limited(res, wait);
    const ops = (req.body || {}).ops;
    if (!Array.isArray(ops) || ops.length > 1000) return err(res, 400, 'payload_invalid');
    res.json(saveOps(req.user.id, ops));
  });

  /* link progress saved on this device before accounts existed: it only fills what the account doesn't have yet
     (every item gets the oldest possible time, so anything already in the cloud stays as it is) */
  api.post('/progress/import', needAuth, (req, res) => {
    const wait = limiter.hit('import:' + req.user.id, 20, 60 * 60 * 1000);
    if (wait) return limited(res, wait);
    const ops = P.stateToOps((req.body || {}).state);
    if (ops.length > 20000) return err(res, 400, 'payload_invalid');
    res.json(saveOps(req.user.id, ops, { forceT: 1 }));
  });

  /* ---------- memory-verse recordings (Friday "say it yourself") ----------
     Stored with the child's account; only that account can list, play or delete them. Deleted with the account. */
  const AUDIO = { 'audio/webm': b => b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])),
    'audio/ogg': b => b.subarray(0, 4).toString('latin1') === 'OggS',
    'audio/mp4': b => b.subarray(4, 8).toString('latin1') === 'ftyp',
    'audio/x-m4a': b => b.subarray(4, 8).toString('latin1') === 'ftyp',
    'audio/aac': b => b[0] === 0xff && (b[1] & 0xf0) === 0xf0,
    'audio/mpeg': b => b.subarray(0, 3).toString('latin1') === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) };
  const KEEP_PER_VERSE = 5;
  api.post('/recordings', needAuth, express.raw({ type: () => true, limit: '4mb' }), (req, res) => {
    const wait = limiter.hit('rec:' + req.user.id, 40, 60 * 60 * 1000);
    if (wait) return limited(res, wait);
    const verse = String(req.query.verse || ''), week = String(req.query.week || '');
    if (!/^[a-z0-9-]{1,40}$/.test(verse) || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(week)) return err(res, 400, 'payload_invalid');
    const mime = String(req.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const body = Buffer.isBuffer(req.body) ? req.body : null;
    if (!AUDIO[mime] || !body || body.length < 200 || !AUDIO[mime](body)) return err(res, 400, 'audio_invalid');
    const id = crypto.randomUUID(), now = Date.now();
    tx(() => {
      q.insertRecording.run(id, req.user.id, verse, week, mime, body.length, now, body);
      q.trimRecordings.run(req.user.id, verse, req.user.id, verse, KEEP_PER_VERSE);   // keep the newest few per verse
    });
    res.status(201).json({ recording: { id, verse, week, mime, size: body.length, created_at: now } });
  });
  api.get('/recordings', needAuth, (req, res) => res.json({ recordings: q.listRecordings.all(req.user.id) }));
  api.get('/recordings/:id', needAuth, (req, res) => {
    const r = /^[0-9a-f-]{36}$/.test(req.params.id) ? q.recording.get(req.params.id, req.user.id) : null;
    if (!r) return err(res, 404, 'not_found');
    res.set({ 'Content-Type': r.mime, 'Content-Length': String(r.size), 'Cache-Control': 'private, no-store', 'Content-Disposition': 'inline' });
    res.end(Buffer.from(r.data));
  });
  api.delete('/recordings/:id', needAuth, (req, res) => {
    const r = q.deleteRecording.run(String(req.params.id), req.user.id);
    if (!r.changes) return err(res, 404, 'not_found');
    res.json({ ok: true });
  });

  api.use((req, res) => err(res, 404, 'not_found'));
  app.use('/api', api);

  /* ---------- the app itself ---------- */
  app.use(express.static(cfg.publicDir, {
    index: 'index.html',
    setHeaders(res, file) {
      if (/\.(html|js|webmanifest)$/.test(file)) res.set('Cache-Control', 'no-cache');
    }
  }));

  app.use((e, req, res, next) => {
    if (e && e.type === 'entity.too.large') return err(res, 413, 'payload_too_large');
    if (e && (e.type === 'entity.parse.failed' || e instanceof SyntaxError)) return err(res, 400, 'payload_invalid');
    if (e && e.status && e.code) return err(res, e.status, e.code);
    console.error(e);
    err(res, 500, 'server_error');
  });

  const sweep = setInterval(() => { try { q.deleteExpired.run(Date.now()); } catch (_) {} }, 60 * 60 * 1000);
  sweep.unref();

  app.locals.store = store;
  app.locals.close = () => { clearInterval(sweep); store.close(); };
  return app;
}

function err(res, status, code, extra) {
  if (extra && extra.retryAfter) res.set('Retry-After', String(extra.retryAfter));
  return res.status(status).json(Object.assign({ error: code }, extra || {}));
}
function wrap(fn) { return (req, res, next) => fn(req, res, next).catch(next); }
function readCookie(req, name) {
  const h = req.headers.cookie;
  if (!h) return null;
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) {
      try { return decodeURIComponent(part.slice(i + 1).trim()); } catch (_) { return null; }
    }
  }
  return null;
}

module.exports = { createApp };
