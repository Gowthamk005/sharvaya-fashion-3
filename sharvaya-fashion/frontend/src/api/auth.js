import { api } from './http.js';

export function login(email, password) {
  return api('/auth/login', { method: 'POST', body: { email, password } });
}

export function currentUser(token) {
  return api('/auth/me', { token });
}
