export function Button({ children, onClick, variant = 'primary', className = '', disabled, type = 'button', loading }) {
  const base = 'font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-primary text-white rounded-xl px-5 py-3 text-sm',
    secondary: 'bg-accent-light text-accent rounded-xl px-4 py-2 text-xs',
    ghost: 'text-muted rounded-xl px-4 py-2 text-sm hover:bg-accent-light',
    danger: 'bg-red-50 text-red-600 rounded-xl px-4 py-2 text-sm',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
      {children}
    </button>
  );
}
