import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { uploadImage } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demoMode';
import { fileToDataUrl } from '../lib/localStore';

export default function Settings() {
  const { profile, updateProfile, signOut, session } = useUser();
  const [budget, setBudget] = useState(profile?.budget_inr || 15000);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateProfile({ budget_inr: Number(budget) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      let url;
      if (DEMO_MODE) {
        url = await fileToDataUrl(file);
      } else {
        url = await uploadImage(file, `${session.user.id}/reference/photo.jpg`);
      }
      await updateProfile({ reference_photo_url: url });
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      <div className="bg-primary text-white px-5 pt-12 pb-4 lg:pt-8 lg:rounded-t-2xl">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Profile */}
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-3">My Profile</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <ProfileRow label="Height" value="185 cm" />
            <ProfileRow label="Weight" value="73 kg" />
            <ProfileRow label="Build" value="Lean" />
            <ProfileRow label="Skin tone" value="Wheatish" />
            <ProfileRow label="Shirt" value="40" />
            <ProfileRow label="T-shirt" value="M oversized / L" />
            <ProfileRow label="Pants" value="32×32" />
            <ProfileRow label="City" value="Delhi" />
          </div>
        </div>

        {/* Reference photo for try-on */}
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-1">Reference Photo</p>
          <p className="text-xs text-muted mb-3">Used for virtual try-on. Full body, plain background, neutral pose.</p>
          {profile?.reference_photo_url ? (
            <div className="relative">
              <img src={profile.reference_photo_url} alt="Reference" className="w-full h-48 object-cover rounded-xl mb-2" />
              <label className="absolute top-2 right-2 bg-white rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer shadow">
                {uploading ? '...' : 'Change'}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-accent-light/50">
              {uploading ? (
                <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-3xl mb-1">🧍</span>
                  <span className="text-xs text-muted">Upload reference photo</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          )}
        </div>

        {/* Budget */}
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-3">Monthly Clothing Budget</p>
          <Input
            label="Budget (₹)"
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
          />
          <Button onClick={handleSave} loading={saving} className="w-full mt-3">
            {saved ? '✓ Saved' : 'Save Budget'}
          </Button>
        </div>

        {/* Account */}
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-3">Account</p>
          <p className="text-sm text-primary mb-3">{session?.user?.email}</p>
          <Button variant="danger" onClick={signOut} className="w-full">Sign Out</Button>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-primary">{value}</p>
    </div>
  );
}
