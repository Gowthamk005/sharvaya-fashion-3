import { useState } from 'react';

// Email + password form for the store owner. The server checks the password and returns a token.
export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err.message);
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-main login-wrap">
      <form className="panel login-panel" onSubmit={submit} noValidate>
        <div>
          <h1 className="login-title">Admin sign in</h1>
          <p className="login-sub">Only the store owner can add or remove products.</p>
        </div>

        <div className="a-field">
          <label htmlFor="a-email">Email</label>
          <input
            id="a-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="a-field">
          <label htmlFor="a-password">Password</label>
          <input
            id="a-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="a-error form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
