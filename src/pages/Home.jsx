import { Link } from 'react-router-dom';
import { Shirt, Sparkles, ShoppingBag } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import WeatherWidget, { useWeatherData } from '../components/weather/WeatherWidget';
import AIStylist from '../components/ai/AIStylist';

export default function Home() {
  const { items, outfits, shoppingList } = useWardrobe();
  const weather = useWeatherData();

  const cleanItems = items.filter(i => i.status === 'Clean').length;
  const toBuy = shoppingList.filter(i => i.status === 'ToBuy').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      {/* Header */}
      <div className="bg-primary text-white px-5 pt-12 pb-6 lg:pt-8 lg:rounded-t-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">{greeting}</p>
            <h1 className="text-2xl font-bold">What to wear?</h1>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">
            👔
          </div>
        </div>

        <WeatherWidget />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 px-4 py-4">
        <StatCard icon={<Shirt size={18} />} label="Clean items" value={cleanItems} to="/wardrobe" />
        <StatCard icon={<Sparkles size={18} />} label="Outfits" value={outfits.length} to="/outfits" />
        <StatCard icon={<ShoppingBag size={18} />} label="To buy" value={toBuy} to="/shop" />
      </div>

      {/* AI Stylist */}
      <div className="px-4 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">✨</span>
          <h2 className="text-sm font-bold text-primary">AI Outfit Suggestions</h2>
        </div>
        <AIStylist weather={weather} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, to }) {
  return (
    <Link to={to} className="bg-surface rounded-2xl p-3 shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
      <div className="text-accent">{icon}</div>
      <p className="text-lg font-extrabold text-primary">{value}</p>
      <p className="text-[10px] text-muted text-center leading-tight">{label}</p>
    </Link>
  );
}
