const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value, ttlMinutes = 60) {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  store.set(key, { value, expiresAt });
}

function makeKey(prefix, params = {}) {
  const stable = Object.keys(params)
    .sort()
    .map((key) => `${key}:${String(params[key] || '').toLowerCase().trim()}`)
    .join('|');
  return `${prefix}:${stable}`;
}

module.exports = { get, set, makeKey };
