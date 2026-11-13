// Talks to the Express API. In development Vite forwards /api to the backend; on Firebase Hosting the
// same /api path is rewritten to the Cloud Function. So no URL changes between the two.
// Set VITE_API_URL only if the API is ever hosted on a different domain.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, details = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function api(path, { method = 'GET', body, token, signal } = {}) {
  const headers = { Accept: 'application/json' };
  let payload;
  if (body instanceof FormData) {
    payload = body; // the browser sets the multipart boundary itself
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body: payload, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('We cannot reach the store right now. Check your connection and try again.');
  }

  if (res.status === 204) return null;
  // A missing or misconfigured API returns a web page, not JSON. Report that instead of treating it as data.
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;
  if (!isJson || (res.ok && data === null)) {
    throw new ApiError('The store server is not responding yet. Please try again in a moment.', { status: res.status || 503 });
  }
  if (!res.ok) {
    throw new ApiError(data?.error || `Something went wrong (${res.status}). Please try again.`, {
      status: res.status,
      details: data?.details || [],
    });
  }
  return data;
}
