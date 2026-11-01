/* Run a browser test on a chosen calendar day, so weekly content (#31, #32 ...) doesn't change under the test.
   Only "what day is it" moves: new Date() starts from that day and keeps ticking, while Date.now() stays real,
   so sync timestamps still order correctly against the server (a faked clock in the past would lose every change).
   pin(chromium, date): every browser context from chromium.launch() gets the shifted day.
   pin.context(ctx, date): the same for one context. */
function script(ms) {
  return `(() => { const R = Date, off = ${ms} - R.now();
    function D(...a) { if (!new.target) return new R(R.now() + off).toString(); return a.length ? new R(...a) : new R(R.now() + off); }
    D.prototype = R.prototype; D.now = R.now; D.UTC = R.UTC; D.parse = R.parse;
    Object.defineProperty(D.prototype, 'constructor', { value: D, writable: true, configurable: true });
    window.Date = D; })();`;
}
async function pinContext(ctx, date) { await ctx.addInitScript(script(date.getTime())); return ctx; }
function pin(chromium, date) {
  const launch = chromium.launch.bind(chromium);
  chromium.launch = async (...a) => {
    const b = await launch(...a), newContext = b.newContext.bind(b);
    b.newContext = async (...o) => pinContext(await newContext(...o), date);
    return b;
  };
}
pin.context = pinContext;
module.exports = pin;
