import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboard from './admin-dashboard'

export default async function AdminPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')
    const { data: properties } = await supabase.from('properties').select('id, title, location, price, area, description, status, cover_image').order('created_at', { ascending: false })
    return <AdminDashboard email={user.email ?? ''} initialProperties={properties ?? []} />
  } catch {
    redirect('/auth/login')
  }
}
