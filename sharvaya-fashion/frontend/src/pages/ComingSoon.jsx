import { Link } from 'react-router-dom';
import './ComingSoon.css';

// Temporary stand-in for pages whose designs have not been shared yet.
export default function ComingSoon({ title }) {
  return (
    <section className="coming-soon">
      <p className="eyebrow">Coming soon</p>
      <h1 className="section-title">{title}</h1>
      <p className="coming-soon-note">This page will be added once its design is ready.</p>
      <Link to="/" className="glow-link">
        Back to Home
      </Link>
    </section>
  );
}
