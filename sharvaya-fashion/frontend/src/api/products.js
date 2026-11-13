import { api } from './http.js';

// Drops empty values and joins arrays, e.g. { sizes: ['S','M'] } -> sizes=S,M
function toQuery(params) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) qs.set(key, value.join(','));
    } else {
      qs.set(key, String(value));
    }
  }
  const text = qs.toString();
  return text ? `?${text}` : '';
}

// Returns { items, total, page, pages }
export function listProducts(params = {}, { signal } = {}) {
  return api(`/products${toQuery(params)}`, { signal });
}

export function createProduct(formData, token) {
  return api('/products', { method: 'POST', body: formData, token });
}

export function deleteProduct(id, token) {
  return api(`/products/${id}`, { method: 'DELETE', token });
}

export function clearProducts(token) {
  return api('/products', { method: 'DELETE', token });
}

export function addDemoProducts(token) {
  return api('/products/demo', { method: 'POST', token });
}
