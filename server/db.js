'use strict';
/* SQLite storage (Node's built-in node:sqlite, so there is no native database driver to install).
   Tables: users (username + password hash + recovery-code hash), sessions (hashed tokens), progress (one JSON document per user). */
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

function openDb(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'iamkids.db'));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      pw_hash       TEXT NOT NULL,
      recovery_hash TEXT,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      last_seen  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
    CREATE TABLE IF NOT EXISTS recordings (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      verse      TEXT NOT NULL,
      week       TEXT NOT NULL,
      mime       TEXT NOT NULL,
      size       INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      data       BLOB NOT NULL
    );
    CREATE INDEX IF NOT EXISTS recordings_user ON recordings(user_id, verse, created_at);
    CREATE TABLE IF NOT EXISTS progress (
      user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      state      TEXT NOT NULL,
      stamps     TEXT NOT NULL,
      version    INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  /* added later: accounts that may preview days that haven't come yet (node server/admin.js make-admin <username>) */
  if (!db.prepare('PRAGMA table_info(users)').all().some(c => c.name === 'is_admin')) db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0');

  const q = {
    setAdmin: db.prepare('UPDATE users SET is_admin = ?, updated_at = ? WHERE id = ?'),
    userByName: db.prepare('SELECT * FROM users WHERE username = ?'),
    userById: db.prepare('SELECT * FROM users WHERE id = ?'),
    insertUser: db.prepare('INSERT INTO users (id, username, pw_hash, recovery_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'),
    setPassword: db.prepare('UPDATE users SET pw_hash = ?, updated_at = ? WHERE id = ?'),
    setRecovery: db.prepare('UPDATE users SET recovery_hash = ?, updated_at = ? WHERE id = ?'),
    deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),

    insertSession: db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at, last_seen) VALUES (?, ?, ?, ?, ?)'),
    sessionByHash: db.prepare('SELECT * FROM sessions WHERE token_hash = ?'),
    touchSession: db.prepare('UPDATE sessions SET expires_at = ?, last_seen = ? WHERE token_hash = ?'),
    deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
    deleteUserSessions: db.prepare('DELETE FROM sessions WHERE user_id = ?'),
    deleteOtherSessions: db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?'),
    deleteExpired: db.prepare('DELETE FROM sessions WHERE expires_at < ?'),

    progressByUser: db.prepare('SELECT * FROM progress WHERE user_id = ?'),
    insertProgress: db.prepare('INSERT INTO progress (user_id, state, stamps, version, updated_at) VALUES (?, ?, ?, ?, ?)'),
    updateProgress: db.prepare('UPDATE progress SET state = ?, stamps = ?, version = ?, updated_at = ? WHERE user_id = ?'),

    insertRecording: db.prepare('INSERT INTO recordings (id, user_id, verse, week, mime, size, created_at, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'),
    listRecordings: db.prepare('SELECT id, verse, week, mime, size, created_at FROM recordings WHERE user_id = ? ORDER BY created_at DESC'),
    recording: db.prepare('SELECT * FROM recordings WHERE id = ? AND user_id = ?'),
    deleteRecording: db.prepare('DELETE FROM recordings WHERE id = ? AND user_id = ?'),
    trimRecordings: db.prepare('DELETE FROM recordings WHERE user_id = ? AND verse = ? AND id NOT IN (SELECT id FROM recordings WHERE user_id = ? AND verse = ? ORDER BY created_at DESC LIMIT ?)'),

    countUsers: db.prepare('SELECT COUNT(*) AS n FROM users')
  };

  /* run several statements as one all-or-nothing step */
  function tx(fn) {
    db.exec('BEGIN IMMEDIATE');
    try { const r = fn(); db.exec('COMMIT'); return r; }
    catch (e) { try { db.exec('ROLLBACK'); } catch (_) {} throw e; }
  }

  return { db, q, tx, close: () => db.close() };
}

module.exports = { openDb };
