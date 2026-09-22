import { SiteHome } from '@/components/site-home'
import { createClient } from '@/lib/supabase/server'

type Property = {
  id: string
  title: string
  location: string
  price: string | number
  area: string | number
  description: string | null
  status: string | null
  cover_image: string | null
}

export default async function Page() {
  let properties: Property[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('properties')
      .select('id, title, location, price, area, description, status, cover_image')
      .order('created_at', { ascending: false })

    properties = data ?? []
  } catch {
    properties = []
  }

  return <SiteHome properties={properties} />
}
