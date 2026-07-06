export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold">{label}</label>}
      <input
        className={`w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-accent transition-colors ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold">{label}</label>}
      <select
        className={`w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-accent transition-colors ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold">{label}</label>}
      <textarea
        className={`w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-accent transition-colors resize-none ${error ? 'border-red-400' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
