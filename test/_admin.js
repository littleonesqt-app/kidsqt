/* Make a test account an admin (it can preview days that haven't come yet), then reload so the app sees it.
   Uses the admin tool on the test server's database: run the tests with DATA_DIR set to that server's data folder. */
const { execFileSync } = require('node:child_process');
const path = require('node:path');
module.exports = async function makeAdmin(page, username) {
  if (!process.env.DATA_DIR) throw new Error('Set DATA_DIR to the test server data folder (see test/run-e2e.sh)');
  execFileSync(process.execPath, [path.join(__dirname, '..', 'server', 'admin.js'), 'make-admin', username], { stdio: 'ignore' });
  if (page) { await page.reload(); await page.waitForLoadState('load'); await page.waitForTimeout(700); }
};
