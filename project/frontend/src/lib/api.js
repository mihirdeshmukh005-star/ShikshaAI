const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

async function request(path, options = {}) {
  const controller = new AbortController();
  const token = localStorage.getItem('edureal_token');
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 45000);
  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }
  if (!response.ok) {
    throw new Error(data?.detail || `Request failed (${response.status})`);
  }
  return data;
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('The AI request timed out. Please try again.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  login(payload) {
    return request('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
  },
  me() { return request('/api/me'); },
  logout() {
    return request('/api/logout', { method: 'POST' }).finally(() => localStorage.removeItem('edureal_token'));
  },

  async register(payload) {
    const data = await request('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    localStorage.setItem('edureal_token', data.token);
    return data;
  },
  startSession(payload) {
    return request('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  teach(payload) {
    return request('/api/teacher/teach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    });
  },
  evaluate(payload) {
    return request('/api/assessment/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    });
  },
  upload(file) {
    const form = new FormData();
    form.append('file', file);
    return request('/api/documents/upload', { method: 'POST', body: form, timeoutMs: 45000 });
  },
  complete(sessionId) {
    return request(`/api/lessons/${sessionId}/complete`, { method: 'POST', timeoutMs: 45000 });
  },
  async downloadReport(sessionId) {
    const token = localStorage.getItem('edureal_token');
    const response = await fetch(`${API_BASE}/api/lessons/${sessionId}/report`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error('Report is not available yet.');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
  session(sessionId) {
    return request(`/api/sessions/${sessionId}`);
  },
};
