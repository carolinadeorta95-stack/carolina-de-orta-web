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
    const propertyResult = await supabase
      .from('properties')
      .select('id, title, location, price, area, description, status, cover_image')
      .order('created_at', { ascending: false })

    if (propertyResult.error) {
      console.error('[v0] No se pudieron cargar las propiedades desde Supabase:', propertyResult.error.message)
    } else {
      properties = propertyResult.data ?? []
    }
  } catch {
    properties = []
  }

  return <SiteHome properties={properties} />
}
