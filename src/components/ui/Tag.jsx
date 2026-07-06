export function Tag({ children, colour }) {
  return (
    <span
      className="bg-accent-light text-accent text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full whitespace-nowrap"
      style={colour ? { backgroundColor: colour + '22', color: colour } : {}}
    >
      {children}
    </span>
  );
}

export function StatusTag({ status }) {
  const styles = {
    ToBuy: 'bg-blue-50 text-blue-600',
    Wishlist: 'bg-purple-50 text-purple-600',
    Bought: 'bg-green-50 text-green-700',
    Clean: 'bg-green-50 text-green-700',
    Worn: 'bg-orange-50 text-orange-600',
    Laundry: 'bg-yellow-50 text-yellow-700',
    DryClean: 'bg-blue-50 text-blue-600',
    ForSale: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full whitespace-nowrap ${styles[status] || 'bg-accent-light text-accent'}`}>
      {status}
    </span>
  );
}
