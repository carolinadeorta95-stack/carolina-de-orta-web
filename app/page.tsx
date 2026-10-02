import { SiteHome } from '@/components/site-home'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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
  introTitle?: string; introLead?: string; introLink?: string; propertiesTitle?: string; propertiesLink?: string; projectsTitle?: string; projectsDescription?: string; projectsLink?: string; journalTitle?: string; journalLink?: string; aboutTitle?: string; aboutLead?: string; aboutDescription?: string; aboutImageUrl?: string; contactTitle?: string; contactDescription?: string; contactEmail?: string; instagramUrl?: string; linkedinUrl?: string; whatsappUrl?: string; footerRole?: string
}

export default async function Page() {
  let properties: Property[] = []
  const settings: SiteSettings = {}

  try {
    const supabase = await createClient()
    const [{ data: propertyData, error: propertyError }, { data: settingData, error: settingsError }] = await Promise.all([
      supabase.from('properties').select('id, title, location, price, area, description, status, cover_image').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('key, value'),
    ])

    if (propertyError) console.error('[v0] Properties load error:', propertyError.message)
    else properties = propertyData ?? []
    if (settingsError) console.error('[v0] site_settings load error:', settingsError.message)

    const allowedKeys = new Set<keyof SiteSettings>(['brandName', 'logoUrl', 'heroImageUrl', 'heroTitle', 'heroDescription', 'introTitle', 'introLead', 'introLink', 'propertiesTitle', 'propertiesLink', 'projectsTitle', 'projectsDescription', 'projectsLink', 'journalTitle', 'journalLink', 'aboutTitle', 'aboutLead', 'aboutDescription', 'aboutImageUrl', 'contactTitle', 'contactDescription', 'contactEmail', 'instagramUrl', 'linkedinUrl', 'whatsappUrl', 'footerRole'])
    for (const setting of settingData ?? []) {
      if (allowedKeys.has(setting.key as keyof SiteSettings)) settings[setting.key as keyof SiteSettings] = setting.value
    }
  } catch (error) {
    console.error('[v0] Public site data load error:', error)
  }

  return <SiteHome properties={properties} settings={settings} />
}
