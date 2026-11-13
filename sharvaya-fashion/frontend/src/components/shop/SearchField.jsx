import { useEffect, useState } from 'react';
import { SearchIcon } from '../icons.jsx';

// Plain search: an icon and an underlined line. Results update as the shopper types (after a short pause),
// or straight away on Enter or a click on the icon.
export default function SearchField({ value, onSearch }) {
  const [text, setText] = useState(value);

  // If the search changes from outside (for example from the navbar search), show it here too
  useEffect(() => {
    setText((current) => (current.trim() === value ? current : value));
  }, [value]);

  // Search as the shopper types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim() !== value) onSearch(text.trim());
    }, 350);
    return () => clearTimeout(timer);
    // only runs when the typed text changes; `value` is read at that moment
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const submit = (e) => {
    e.preventDefault();
    onSearch(text.trim());
  };

  return (
    <form className="shop-search" role="search" onSubmit={submit}>
      <button type="submit" className="shop-search-icon" aria-label="Search products">
        <SearchIcon size={20} />
      </button>
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search by cloth or name..."
        aria-label="Search by cloth or name"
        enterKeyHint="search"
        maxLength={80}
      />
    </form>
  );
}
