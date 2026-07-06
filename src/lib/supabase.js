import { createClient } from '@supabase/supabase-js';

// Fall back to a placeholder so createClient doesn't throw before .env is filled in.
// DEMO_MODE (see demoMode.js) ensures this client is never actually called until then.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage helpers
export const STORAGE_BUCKET = 'wardrobe';

export async function uploadImage(file, path) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);
  return urlData.publicUrl;
}

export function getPublicUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
