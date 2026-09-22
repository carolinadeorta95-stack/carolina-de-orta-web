import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboard from './admin-dashboard'

export default async function AdminPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')
    const [{ data: properties }, { data: settings }] = await Promise.all([
      supabase.from('properties').select('id, title, location, price, area, description, status, cover_image').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('key, value'),
    ])
    const initialSettings = Object.fromEntries((settings ?? []).map(({ key, value }) => [key, value]))
    return <AdminDashboard email={user.email ?? ''} initialProperties={properties ?? []} initialSettings={initialSettings} />
  } catch {
    redirect('/auth/login')
  }
}
