export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init && init.headers ? init.headers : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    let detail: any = undefined;
    try { detail = await res.json(); } catch {}
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText} ${detail ? JSON.stringify(detail) : ''}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  del: (path: string) => request(path, { method: 'DELETE' }),
};
