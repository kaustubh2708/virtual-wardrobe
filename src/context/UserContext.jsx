import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE, DEMO_USER_ID } from '../lib/demoMode';
import { loadLocal, saveLocal } from '../lib/localStore';

const UserContext = createContext(null);

const DEFAULT_DEMO_PROFILE = {
  id: DEMO_USER_ID,
  reference_photo_url: null,
  budget_inr: 15000,
  skin_tone: 'Wheatish',
  height_cm: 185,
  weight_kg: 73,
  build: 'Lean',
  city: 'Delhi',
};

export function UserProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setSession({ user: { id: DEMO_USER_ID, email: 'demo@local' } });
      setProfile(loadLocal('profile', DEFAULT_DEMO_PROFILE));
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!data) {
      // Create default profile
      const { data: newProfile } = await supabase
        .from('user_profiles')
        .insert({ id: userId })
        .select()
        .single();
      setProfile(newProfile);
    } else {
      setProfile(data);
    }
    setLoading(false);
  }

  async function updateProfile(updates) {
    if (DEMO_MODE) {
      const next = { ...profile, ...updates };
      setProfile(next);
      saveLocal('profile', next);
      return { data: next, error: null };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();
    if (!error) setProfile(data);
    return { data, error };
  }

  async function signOut() {
    if (DEMO_MODE) return; // nothing to sign out of in demo mode
    await supabase.auth.signOut();
  }

  return (
    <UserContext.Provider value={{ session, profile, loading, updateProfile, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
