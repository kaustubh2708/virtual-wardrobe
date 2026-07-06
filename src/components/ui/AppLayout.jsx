import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import { DEMO_MODE } from '../../lib/demoMode';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen lg:min-w-0">
        {DEMO_MODE && (
          <div className="bg-amber-100 border-b border-amber-200 px-4 py-1.5 text-center sticky top-0 z-30">
            <p className="text-[10px] text-amber-800 font-bold tracking-wide">
              DEMO MODE — data stored on this device. Connect Supabase in .env to go live.
            </p>
          </div>
        )}

        <main className="flex-1 pb-20 lg:pb-12">
          <div className="lg:max-w-6xl lg:mx-auto lg:px-10 lg:py-8">
            <Outlet />
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
