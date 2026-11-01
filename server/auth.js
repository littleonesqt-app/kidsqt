'use strict';
/* Passwords and recovery codes: Argon2id (OWASP-recommended settings). Session tokens: 256-bit random,
   only their SHA-256 is stored, so a copied database can't be used to sign in. */
const crypto = require('node:crypto');
const argon2 = require('argon2');

const ARGON = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };

const hashSecret = s => argon2.hash(s, ARGON);
async function verifySecret(hash, s) {
  try { return await argon2.verify(hash, s); } catch (_) { return false; }
}
/* a real Argon2id hash used when the username doesn't exist, so "no such user" takes as long as "wrong password" */
let dummyHash = null;
async function dummyVerify(s) {
  if (!dummyHash) dummyHash = await hashSecret(crypto.randomBytes(16).toString('hex'));
  await verifySecret(dummyHash, s);
  return false;
}

const newToken = () => crypto.randomBytes(32).toString('base64url');
const tokenHash = t => crypto.createHash('sha256').update(t).digest('hex');

/* recovery code: 12 characters from an alphabet without look-alikes (no 0/O, 1/I/L), shown as XXXX-XXXX-XXXX */
const CODE_ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newRecoveryCode() {
  let s = '';
  const bytes = crypto.randomBytes(24);
  for (let i = 0; s.length < 12; i++) {
    const b = bytes[i % bytes.length];
    if (b < 248) s += CODE_ALPHA[b % CODE_ALPHA.length];          // 248 = 8*31, avoids modulo bias
    if (i > 200) break;
  }
  return s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8, 12);
}
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);

/* ---------- input rules ---------- */
const RESERVED = new Set(['admin', 'administrator', 'root', 'system', 'support', 'iamchurch', 'teacher', 'moderator']);
function checkUsername(raw) {
  const u = String(raw || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{4,20}$/.test(u)) return { error: 'username_invalid' };
  if (RESERVED.has(u)) return { error: 'username_taken' };
  return { username: u };
}
const COMMON = new Set(['123456', '1234567', '12345678', '123456789', '1234567890', '654321', '111111', '000000', '123123', 'abc123', 'password', 'password1', 'qwerty', 'qwerty123', 'iloveyou', 'abcdef', 'abcd1234', 'asdfgh', 'jesus1', 'jesus123', 'church', 'iamchurch', 'qwer1234', '1q2w3e4r', 'letmein']);
function checkPassword(p, username, minLen) {
  if (typeof p !== 'string') return 'password_too_short';
  if (p.length < minLen) return 'password_too_short';
  if (p.length > 64) return 'password_too_long';
  const low = p.toLowerCase();
  if (username && low.includes(username)) return 'password_same_as_username';
  if (COMMON.has(low) || /^(.)\1+$/.test(p)) return 'password_weak';
  return null;
}

/* ---------- rate limiting (in memory; fine for one server process) ---------- */
class Limiter {
  constructor() { this.hits = new Map(); this.fails = new Map(); setInterval(() => this.sweep(), 60000).unref(); }
  /* at most `max` calls per `windowMs` for this key */
  hit(key, max, windowMs) {
    const now = Date.now();
    let e = this.hits.get(key);
    if (!e || now - e.start > windowMs) { e = { start: now, n: 0 }; this.hits.set(key, e); }
    e.n++;
    if (e.n > max) return Math.ceil((e.start + windowMs - now) / 1000);
    return 0;
  }
  /* failed sign-ins: after 5 in a row the account waits 30s, then 1, 2, 4… minutes (max 15) */
  lockedFor(key) {
    const e = this.fails.get(key);
    if (!e || !e.until) return 0;
    const s = Math.ceil((e.until - Date.now()) / 1000);
    return s > 0 ? s : 0;
  }
  fail(key) {
    const now = Date.now();
    const e = this.fails.get(key) || { n: 0, until: 0, last: now };
    if (now - e.last > 60 * 60 * 1000) e.n = 0;
    e.n++; e.last = now;
    if (e.n >= 5) e.until = now + Math.min(15 * 60 * 1000, 30000 * Math.pow(2, e.n - 5));
    this.fails.set(key, e);
  }
  ok(key) { this.fails.delete(key); }
  sweep() {
    const now = Date.now();
    for (const [k, e] of this.hits) if (now - e.start > 2 * 60 * 60 * 1000) this.hits.delete(k);
    for (const [k, e] of this.fails) if (now - e.last > 2 * 60 * 60 * 1000 && (!e.until || e.until < now)) this.fails.delete(k);
  }
}

module.exports = { hashSecret, verifySecret, dummyVerify, newToken, tokenHash, newRecoveryCode, normCode, checkUsername, checkPassword, Limiter };
