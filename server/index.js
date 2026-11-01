'use strict';
/* Start the server. Settings come from environment variables (see .env.example). */
process.removeAllListeners('warning');   // hide node:sqlite's "experimental" notice; other warnings still print below
process.on('warning', w => { if (!/SQLite is an experimental/.test(w.message)) console.warn(w); });

const path = require('node:path');
const { createApp } = require('./app');

const env = process.env;
const prod = env.NODE_ENV === 'production';
const cfg = {
  dataDir: env.DATA_DIR || path.join(__dirname, '..', 'data'),
  cookieSecure: env.COOKIE_SECURE ? env.COOKIE_SECURE !== 'false' : prod,
  trustProxy: env.TRUST_PROXY ? (/^\d+$/.test(env.TRUST_PROXY) ? Number(env.TRUST_PROXY) : env.TRUST_PROXY) : false,
  sessionDays: Number(env.SESSION_DAYS || 90),
  minPasswordLength: Number(env.MIN_PASSWORD_LENGTH || 6),
  signupPerHour: Number(env.SIGNUPS_PER_HOUR_PER_IP || 60),
  loginPer15Min: Number(env.LOGINS_PER_15MIN_PER_IP || 300),
  allowedOrigins: (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
};
const port = Number(env.PORT || 3000);
const host = env.HOST || '0.0.0.0';

const app = createApp(cfg);
const server = app.listen(port, host, () => {
  console.log(`IAM Kids QT server on http://${host}:${port}  (data: ${cfg.dataDir}, secure cookies: ${cfg.cookieSecure})`);
  if (prod && !cfg.cookieSecure) console.warn('WARNING: COOKIE_SECURE=false in production. Serve the app over HTTPS and turn it on.');
});
function stop() { server.close(() => { app.locals.close(); process.exit(0); }); setTimeout(() => process.exit(0), 5000).unref(); }
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
