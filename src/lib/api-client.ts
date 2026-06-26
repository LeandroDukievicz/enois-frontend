export class ApiError extends Error {
  status: number;
  code: string | undefined;
  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function baseUrl(): string {
  if (import.meta.env.DEV) return '/api';
  return import.meta.env.VITE_API_BACKEND ?? '/api';
}

export function getSessionToken(): string | null {
  return localStorage.getItem('session_token');
}

export function clearSession() {
  localStorage.removeItem('session_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('current_user');
}

async function tryRefreshToken(): Promise<boolean> {
  const token = localStorage.getItem('refresh_token');
  if (!token) return false;
  try {
    const res = await fetch(`${baseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });
    if (!res.ok) { clearSession(); return false; }
    const data = await res.json();
    const body = data?.body ?? data;
    localStorage.setItem('session_token', body.token);
    localStorage.setItem('refresh_token', body.refreshToken);
    return true;
  } catch {
    return false;
  }
}

let isRefreshing = false;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getSessionToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['X-Session-Token'] = token;

  const response = await fetch(`${baseUrl()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if ((response.status === 401 || response.status === 403) && !isRefreshing) {
    const errBody = await response.json().catch(() => null);
    throw new ApiError(response.status, errBody?.code, errBody?.message ?? 'Credenciais inválidas.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new ApiError(response.status, err?.code, err?.message ?? response.statusText);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') return undefined as T;

  const data = await response.json();
  return (data?.body !== undefined ? data.body : data) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export function buildQuery(params: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      search.append(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : '';
}
