import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { WardrobeProvider } from './context/WardrobeContext';
import AppLayout from './components/ui/AppLayout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Wardrobe from './pages/Wardrobe';
import Outfits from './pages/Outfits';
import Shopping from './pages/Shopping';
import More from './pages/More';
import Insights from './pages/Insights';
import Calendar from './pages/Calendar';
import MoodBoard from './pages/MoodBoard';
import Travel from './pages/Travel';
import Settings from './pages/Settings';

function AppRoutes() {
  const { session, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl">👔</span>
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) return <Auth />;

  return (
    <WardrobeProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/outfits" element={<Outfits />} />
          <Route path="/shop" element={<Shopping />} />
          <Route path="/more" element={<More />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/moodboard" element={<MoodBoard />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </WardrobeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}
