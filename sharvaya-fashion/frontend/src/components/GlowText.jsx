// Text that stays normal until the user hovers, clicks (focus) or touches it,
// then glows golden. The styling lives in .glow-text (src/index.css).
export default function GlowText({ as: Tag = 'p', className = '', children }) {
  return (
    <Tag className={`glow-text ${className}`} tabIndex={0}>
      {children}
    </Tag>
  );
}
