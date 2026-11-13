import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import SearchBox from './SearchBox.jsx';
import { CartIcon, CloseIcon, MenuIcon } from './icons.jsx';
import { useStore } from '../context/StoreContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { cartCount } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // "Contact Us" scrolls to the contact section; it is on the home page and at the end of the About page
  const goToContact = (e) => {
    e.preventDefault();
    setOpen(false);
    const contact = document.getElementById('contact');
    if (contact) {
      contact.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: 'contact' } });
    }
  };

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link to="/" className="brand" aria-label="Sharvaya Fashion - home">
          <span className="brand-name">Sharvaya</span>
          <span className="brand-sub">Fashion</span>
        </Link>

        <div className={`nav-panel ${open ? 'is-open' : ''}`} id="nav-panel">
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/" end className="glow-link nav-link">
              Home
            </NavLink>
            <NavLink to="/shop" className="glow-link nav-link">
              Shop All
            </NavLink>
            <NavLink to="/about" className="glow-link nav-link">
              About Us
            </NavLink>
            <a href="/#contact" className="glow-link nav-link" onClick={goToContact}>
              Contact Us
            </a>
          </nav>
          <SearchBox />
        </div>

        <div className="nav-right">
          <Link to="/cart" className="cart-btn" aria-label={`Cart, ${cartCount} items`}>
            <CartIcon />
            {cartCount > 0 && (
              <span key={cartCount} className="cart-badge">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="nav-panel"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
