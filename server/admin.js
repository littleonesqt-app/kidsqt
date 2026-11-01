'use strict';
/* Admin tool for the church's IT person, run on the server:
     node server/admin.js list                      usernames and sign-up dates
     node server/admin.js reset-password <username> new temporary password + new recovery code (when both are lost)
     node server/admin.js delete-user <username>    removes the account and all its progress
     node server/admin.js backup [file]             copy of the whole database (safe while running)
     node server/admin.js make-admin <username>     this account can preview days that haven't come yet (teachers, admins)
     node server/admin.js remove-admin <username>   back to a normal account
   In Docker:  docker compose exec app node server/admin.js list */
process.removeAllListeners('warning');
const path = require('node:path');
const crypto = require('node:crypto');
const { openDb } = require('./db');
const A = require('./auth');

async function main() {
  const [cmd, name] = process.argv.slice(2);
  const store = openDb(process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
  const { q, db } = store;
  const user = () => {
    const u = q.userByName.get(String(name || '').trim().toLowerCase());
    if (!u) { console.error('No such username: ' + name); process.exit(1); }
    return u;
  };
  if (cmd === 'list') {
    const rows = db.prepare('SELECT username, created_at, is_admin FROM users ORDER BY created_at').all();
    rows.forEach(r => console.log(r.username.padEnd(22) + new Date(r.created_at).toISOString().slice(0, 10) + (r.is_admin ? '  admin' : '')));
    console.log(rows.length + ' account(s)');
  } else if (cmd === 'reset-password') {
    const u = user();
    const temp = crypto.randomBytes(6).toString('base64url').replace(/[-_]/g, 'x').slice(0, 8);
    const code = A.newRecoveryCode();
    const now = Date.now();
    q.setPassword.run(await A.hashSecret(temp), now, u.id);
    q.setRecovery.run(await A.hashSecret(A.normCode(code)), now, u.id);
    q.deleteUserSessions.run(u.id);
    console.log('Username:           ' + u.username);
    console.log('Temporary password: ' + temp + '   (ask the child to change it in Profile > Change password)');
    console.log('New recovery code:  ' + code + '   (give it to the parent)');
  } else if (cmd === 'delete-user') {
    const u = user();
    q.deleteUser.run(u.id);
    console.log('Deleted ' + u.username + ' and all of their progress.');
  } else if (cmd === 'make-admin' || cmd === 'remove-admin') {
    const u = user(), on = cmd === 'make-admin';
    q.setAdmin.run(on ? 1 : 0, Date.now(), u.id);
    console.log(on ? u.username + " is now an admin: can preview days that haven't come yet (reopen the app to see it)."
                   : u.username + ' is a normal account again.');
  } else if (cmd === 'backup') {
    /* consistent copy of the whole database while the app keeps running */
    const out = path.resolve(name || ('iamkids-backup-' + new Date().toISOString().slice(0, 10) + '.db'));
    if (/'/.test(out)) { console.error('Please use a path without quotes.'); process.exit(1); }
    db.exec(`VACUUM INTO '${out}'`);
    console.log('Backup written to ' + out);
  } else {
    console.log('Usage: node server/admin.js list | reset-password <username> | delete-user <username> | make-admin <username> | remove-admin <username> | backup [file]');
  }
  store.close();
}
main().catch(e => { console.error(e); process.exit(1); });
