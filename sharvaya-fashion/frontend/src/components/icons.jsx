// Inline SVG icons (no extra packages). To use your own cart icon, replace CartIcon below.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const SearchIcon = ({ size = 20, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);

// Modern shopping-bag style cart icon
export const CartIcon = ({ size = 26, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} strokeWidth={1.6} {...p}>
    <path d="M6.2 8.2h11.6l1.1 11.1a1.2 1.2 0 0 1-1.2 1.3H6.3a1.2 1.2 0 0 1-1.2-1.3L6.2 8.2Z" />
    <path d="M8.8 10.4V7.6a3.2 3.2 0 0 1 6.4 0v2.8" />
  </svg>
);

export const MenuIcon = ({ size = 24, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = ({ size = 24, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ArrowLeftIcon = ({ size = 22, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
);

export const ArrowRightIcon = ({ size = 22, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const HangerIcon = ({ size = 40, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} strokeWidth={1.3} {...p}>
    <path d="M12 8.2V7.4a2.3 2.3 0 1 0-2.3-2.3" />
    <path d="M12 8.2 3.5 15.2a1.3 1.3 0 0 0 .85 2.3h15.3a1.3 1.3 0 0 0 .85-2.3L12 8.2Z" />
  </svg>
);

export const PlusIcon = ({ size = 20, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const TrashIcon = ({ size = 18, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 19l1-12M9 7V4.5h6V7" />
  </svg>
);

export const UploadIcon = ({ size = 28, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
    <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
  </svg>
);
