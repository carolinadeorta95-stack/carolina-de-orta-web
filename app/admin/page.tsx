import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboard from './admin-dashboard'

export default async function AdminPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')
    const [{ data: properties }, { data: settings }, { data: images }] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('key, value'),
      supabase.from('property_images').select('id, property_id, image_url, storage_path, is_cover, sort_order').order('sort_order'),
    ])
    const initialSettings = Object.fromEntries((settings ?? []).map(({ key, value }) => [key, value]))
    return <AdminDashboard email={user.email ?? ''} initialProperties={properties ?? []} initialImages={images ?? []} initialSettings={initialSettings} />
  } catch {
    redirect('/auth/login')
  }
}
