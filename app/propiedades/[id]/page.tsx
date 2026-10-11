import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PropertyDetail from '@/components/property-detail'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export default async function PropertyDetailRoute({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: property, error: propertyError }, { data: images }, { data: settings }] = await Promise.all([
    supabase.from('properties').select('id, property_code, title, location, address, neighborhood, city, province, price, description, status, operation_type, property_type, featured, bedrooms, bathrooms, garages, covered_area_m2, land_area_m2, cover_image').eq('id', id).eq('published', true).maybeSingle(),
    supabase.from('property_images').select('id, property_id, image_url, is_cover, sort_order').eq('property_id', id).order('sort_order'),
    supabase.from('site_settings').select('key, value').in('key', ['contactWhatsapp', 'footerBrand', 'footerRole', 'logoUrl']),
  ])

  if (propertyError || !property) notFound()
  const values = Object.fromEntries((settings ?? []).map(({ key, value }) => [key, value]))
  return <PropertyDetail property={property} images={images ?? []} whatsappUrl={values.contactWhatsapp} footerBrand={values.footerBrand} footerRole={values.footerRole} logoUrl={values.logoUrl} />
}

export function generateMetadata() {
  return { title: 'Propiedad | Carolina de Orta' }
}
