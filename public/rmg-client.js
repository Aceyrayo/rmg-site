/* RMG client helper: one place for the API URL, server wake-up, timeouts and readable errors. */
window.RMG = {
  API: 'https://rmg-api-e46k.onrender.com',
  wake() { fetch(this.API + '/').catch(() => {}); },   // Render's free tier sleeps; poke it as soon as a page loads
  async call(path, opts = {}, onSlow) {
    const ctrl = new AbortController();
    const slow = setTimeout(() => onSlow && onSlow(), 5000);
    const stop = setTimeout(() => ctrl.abort(), 75000);
    try {
      const res = await fetch(this.API + path, { ...opts, signal: ctrl.signal });
      let data = {}; try { data = await res.json(); } catch (e) {}
      let msg = data.detail;
      if (Array.isArray(msg)) msg = msg.map(d => (d.msg || '').replace(/^Value error, /, '')).join('. ');
      return { ok: res.ok, status: res.status, data, message: msg || (res.ok ? '' : 'Something went wrong (' + res.status + ').') };
    } catch (e) {
      return { ok: false, status: 0, data: {}, message: e.name === 'AbortError' ? 'The server took too long to respond. Please try again.' : 'Cannot reach the server. Check your connection and try again.' };
    } finally { clearTimeout(slow); clearTimeout(stop); }
  }
};
RMG.wake();
