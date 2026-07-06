import { Link } from 'react-router-dom';
import { BarChart2, Calendar, Image, Luggage, Settings } from 'lucide-react';

const LINKS = [
  { to: '/insights', icon: BarChart2, label: 'Insights', desc: 'Cost per wear, style DNA, colour story' },
  { to: '/calendar', icon: Calendar, label: 'Calendar', desc: 'Plan outfits for upcoming days' },
  { to: '/moodboard', icon: Image, label: 'Mood Board', desc: 'Inspiration and wishlist images' },
  { to: '/travel', icon: Luggage, label: 'Travel Packs', desc: 'Build packing lists for trips' },
  { to: '/settings', icon: Settings, label: 'Settings', desc: 'Profile, reference photo, preferences' },
];

export default function More() {
  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      <div className="bg-primary text-white px-5 pt-12 pb-4 lg:pt-8 lg:rounded-t-2xl">
        <h1 className="text-xl font-bold">More</h1>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        {LINKS.map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 bg-accent-light rounded-xl flex items-center justify-center">
              <Icon size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">{label}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
