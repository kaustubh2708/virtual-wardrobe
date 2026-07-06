import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { uploadImage } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demoMode';
import { fileToDataUrl } from '../lib/localStore';

const BUILDS = ['Lean', 'Athletic', 'Average', 'Broad', 'Heavyset'];
const SKIN_TONES = ['Fair', 'Wheatish', 'Dusky', 'Deep'];

export default function Settings() {
  const { profile, updateProfile, signOut, session } = useUser();
  const [budget, setBudget] = useState(profile?.budget_inr || 15000);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable profile — these feed the AI stylist prompts, so keeping them
  // accurate directly improves suggestion quality.
  const [form, setForm] = useState({
    height_cm: profile?.height_cm ?? 185,
    weight_kg: profile?.weight_kg ?? 73,
    build: profile?.build ?? 'Lean',
    skin_tone: profile?.skin_tone ?? 'Wheatish',
    city: profile?.city ?? 'Delhi',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleProfileSave() {
    setProfileSaving(true);
    await updateProfile({
      ...form,
      height_cm: Number(form.height_cm) || null,
      weight_kg: Number(form.weight_kg) || null,
    });
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

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
        {/* Profile — feeds the AI stylist, so keep it accurate */}
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-1">My Profile</p>
          <p className="text-xs text-muted mb-3">The AI stylist personalises every suggestion to these.</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Height (cm)" type="number" value={form.height_cm} onChange={set('height_cm')} />
            <Input label="Weight (kg)" type="number" value={form.weight_kg} onChange={set('weight_kg')} />
            <Select label="Build" value={form.build} onChange={set('build')}>
              {BUILDS.map(b => <option key={b}>{b}</option>)}
            </Select>
            <Select label="Skin tone" value={form.skin_tone} onChange={set('skin_tone')}>
              {SKIN_TONES.map(s => <option key={s}>{s}</option>)}
            </Select>
            <div className="col-span-2">
              <Input label="City" value={form.city} onChange={set('city')} />
            </div>
          </div>
          <Button onClick={handleProfileSave} loading={profileSaving} className="w-full mt-3">
            {profileSaved ? '✓ Saved' : 'Save Profile'}
          </Button>
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

