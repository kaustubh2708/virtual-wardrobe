import { NavLink } from 'react-router-dom';
import { Sun, Shirt, Sparkles, ShoppingBag, Grid } from 'lucide-react';

const tabs = [
  { to: '/', icon: Sun, label: 'Home' },
  { to: '/wardrobe', icon: Shirt, label: 'Wardrobe' },
  { to: '/outfits', icon: Sparkles, label: 'Outfits' },
  { to: '/shop', icon: ShoppingBag, label: 'Shop' },
  { to: '/more', icon: Grid, label: 'More' },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface border-t border-border z-20 safe-area-bottom">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[9px] uppercase tracking-wide font-bold ${isActive ? 'text-primary' : 'text-muted'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
