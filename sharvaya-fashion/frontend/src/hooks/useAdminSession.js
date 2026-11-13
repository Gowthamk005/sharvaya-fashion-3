import { useCallback, useEffect, useState } from 'react';
import { currentUser, login as apiLogin } from '../api/auth.js';

// The admin's token lives in this browser only. It expires after 12 hours (set on the server).
const TOKEN_KEY = 'sharvaya.adminToken';

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function saveToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked: the admin just has to sign in again next time */
  }
}

export function useAdminSession() {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(readToken()));

  // On page load, check that a saved token is still valid.
  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    currentUser(token)
      .then((res) => !cancelled && setUser(res.user))
      .catch((err) => {
        // Only a rejected token signs the admin out. A network problem keeps the session.
        if (!cancelled && err.status === 401) {
          saveToken('');
          setToken('');
        }
      })
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password);
    if (!res?.token || !res?.user) {
      throw new Error('Sign-in failed. The store server did not return a session. Please try again.');
    }
    saveToken(res.token);
    setUser(res.user);
    setToken(res.token);
  }, []);

  const logout = useCallback(() => {
    saveToken('');
    setToken('');
    setUser(null);
  }, []);

  return { token, user, checking, login, logout };
}
