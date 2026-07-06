import { NavLink } from 'react-router-dom';
import { Sun, Shirt, Sparkles, ShoppingBag, BarChart2, Calendar, Image, Luggage, Settings } from 'lucide-react';

const PRIMARY_LINKS = [
  { to: '/', icon: Sun, label: 'Home' },
  { to: '/wardrobe', icon: Shirt, label: 'Wardrobe' },
  { to: '/outfits', icon: Sparkles, label: 'Outfits' },
  { to: '/shop', icon: ShoppingBag, label: 'Shop' },
];

const SECONDARY_LINKS = [
  { to: '/insights', icon: BarChart2, label: 'Insights' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/moodboard', icon: Image, label: 'Mood Board' },
  { to: '/travel', icon: Luggage, label: 'Travel' },
];

const SETTINGS_LINK = { to: '/settings', icon: Settings, label: 'Settings' };

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 bg-surface border-r border-border sticky top-0 h-screen">
      <div className="px-6 py-6 border-b border-border flex items-center gap-2.5">
        <span className="text-2xl">👔</span>
        <span className="font-bold text-primary text-[15px] leading-tight">Virtual<br />Wardrobe</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3 flex flex-col">
        <NavGroup links={PRIMARY_LINKS} />
        <div className="my-4 border-t border-border" />
        <NavGroup links={SECONDARY_LINKS} />
        <div className="my-4 border-t border-border" />
        <NavGroup links={[SETTINGS_LINK]} />
      </nav>

      <div className="px-6 py-4 border-t border-border">
        <p className="text-[10px] text-muted uppercase tracking-wide font-bold">Delhi, India</p>
        <p className="text-[11px] text-muted mt-0.5">185cm · Lean · Wheatish</p>
      </div>
    </aside>
  );
}

function NavGroup({ links }) {
  return (
    <div className="flex flex-col gap-0.5">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive ? 'bg-primary text-white' : 'text-muted hover:bg-accent-light hover:text-primary'
            }`
          }
        >
          <Icon size={18} strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </div>
  );
}
