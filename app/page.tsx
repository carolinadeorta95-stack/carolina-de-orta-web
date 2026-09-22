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

type SiteSettings = {
  brandName?: string
  logoUrl?: string
  heroImageUrl?: string
  heroTitle?: string
  heroDescription?: string
  primaryColor?: string
  accentColor?: string
}

const settingKeyMap: Record<string, keyof SiteSettings> = {
  brandName: 'brandName',
  logoUrl: 'logoUrl',
  heroImageUrl: 'heroImageUrl',
  heroTitle: 'heroTitle',
  heroDescription: 'heroDescription',
  primaryColor: 'primaryColor',
  accentColor: 'accentColor',
}

export default async function Page() {
  let properties: Property[] = []
  const settings: SiteSettings = {}

  try {
    const supabase = await createClient()
    const [{ data: propertyData }, { data: settingData }] = await Promise.all([
      supabase
        .from('properties')
        .select('id, title, location, price, area, description, status, cover_image')
        .order('created_at', { ascending: false }),
      supabase.from('site_settings').select('key, value'),
    ])

    properties = propertyData ?? []
    for (const setting of settingData ?? []) {
      const field = settingKeyMap[setting.key]
      if (field && setting.value) settings[field] = setting.value
    }
  } catch {
    properties = []
  }

  return <SiteHome properties={properties} settings={settings} />
}
