import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from './icons.jsx';

// Plain icon + "Search..." text by default; turns into a square input box on hover/focus (see Navbar.css).
export default function SearchBox() {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const q = value.trim();
    // The Shop All page will read ?q= once it is built.
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <form className="search-slot" role="search" onSubmit={submit}>
      <div className="search-box">
        <button type="submit" className="search-btn" aria-label="Search">
          <SearchIcon size={19} />
        </button>
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search..."
          aria-label="Search products"
        />
      </div>
    </form>
  );
}
