const BASE = '';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('dt_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(BASE + path, { ...options, headers });
  
  if (res.status === 401) {
    localStorage.removeItem('dt_token');
    localStorage.removeItem('dt_user');
    window.location.href = '/index.html';
    return;
  }
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

window.apiFetch = apiFetch;
