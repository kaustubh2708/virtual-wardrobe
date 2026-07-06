import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleMagicLink(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">👔</div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Virtual Wardrobe</h1>
          <p className="text-sm text-muted mt-1">Your personal style, organised.</p>
        </div>

        {sent ? (
          <div className="bg-surface rounded-2xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-3">📧</div>
            <h2 className="font-bold text-primary mb-1">Check your email</h2>
            <p className="text-sm text-muted">We sent a magic link to <strong>{email}</strong>. Tap it to sign in.</p>
            <button
              className="mt-4 text-xs text-muted underline"
              onClick={() => { setSent(false); setEmail(''); }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="bg-surface rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-muted mb-4">Sign in with a magic link — no password needed.</p>
            <div className="mb-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <Button type="submit" className="w-full" loading={loading} disabled={!email}>
              Send Magic Link
            </Button>
          </form>
        )}

        <p className="text-center text-[11px] text-muted mt-6">
          Your wardrobe is private and secure.
        </p>
      </motion.div>
    </div>
  );
}
