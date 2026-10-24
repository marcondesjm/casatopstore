import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export function requireSupabase() {
  if (!supabase) throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY e publique novamente.');
  return supabase;
}
export async function readSiteConfig() {
  const { data, error } = await requireSupabase().from('site_config').select('content').eq('id', 'main').maybeSingle();
  if (error) throw error;
  return data?.content || null;
}
export async function isSiteAdmin(userId) {
  if (!userId) return false;
  const { data, error } = await requireSupabase().from('site_admins').select('user_id').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
export async function writeSiteConfig(content) {
  const { error } = await requireSupabase().from('site_config').upsert({ id: 'main', content });
  if (error) throw error;
}
