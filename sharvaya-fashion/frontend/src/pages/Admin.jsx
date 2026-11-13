import { Link } from 'react-router-dom';
import AdminDashboard from './AdminDashboard.jsx';
import AdminLogin from '../components/AdminLogin.jsx';
import { ArrowLeftIcon } from '../components/icons.jsx';
import { useAdminSession } from '../hooks/useAdminSession.js';
import './Admin.css';

// /admin: the sign-in form, or the product dashboard once the owner has signed in.
export default function Admin() {
  const session = useAdminSession();

  let content;
  if (session.checking) {
    content = <p className="admin-loading">Checking sign-in...</p>;
  } else if (!session.user) {
    content = <AdminLogin onLogin={session.login} />;
  } else {
    content = <AdminDashboard token={session.token} user={session.user} onSignOut={session.logout} />;
  }

  return (
    <div className="admin">
      <header className="admin-top">
        <div className="admin-logo">
          <span className="admin-logo-mark">S</span>
          <span className="admin-logo-text">Sharvaya</span>
          <span className="admin-tag">Admin</span>
        </div>
        <div className="admin-top-right">
          {session.user && (
            <>
              <span className="admin-user" title={session.user.email}>
                {session.user.email}
              </span>
              <button type="button" className="admin-back" onClick={session.logout}>
                Sign out
              </button>
            </>
          )}
          <Link to="/" className="admin-back">
            <ArrowLeftIcon size={18} />
            View store
          </Link>
        </div>
      </header>

      {content}
    </div>
  );
}
