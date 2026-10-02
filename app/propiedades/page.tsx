import { PropertiesPage } from '@/components/properties-page'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Property = {
  id: string
  property_code?: string | null
  title: string
  location: string
  price: string | number | null
  area: string | number | null
  status?: string | null
  operation_type?: string | null
  property_type?: string | null
  cover_image?: string | null
}

type PropertyImage = { property_id: string; image_url: string; is_cover: boolean; sort_order: number }

export default async function PropertiesRoute() {
  const supabase = await createClient()
  const [{ data: properties }, { data: images }] = await Promise.all([
    supabase.from('properties').select('id, property_code, title, location, price, area, status, operation_type, property_type, cover_image').eq('published', true).order('created_at', { ascending: false }),
    supabase.from('property_images').select('property_id, image_url, is_cover, sort_order').order('sort_order'),
  ])
  return <PropertiesPage properties={(properties ?? []) as Property[]} images={(images ?? []) as PropertyImage[]} />
}
