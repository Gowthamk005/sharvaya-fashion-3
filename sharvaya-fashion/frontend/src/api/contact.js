import { api } from './http.js';

export function sendContactMessage(values) {
  return api('/contact', { method: 'POST', body: values });
}
