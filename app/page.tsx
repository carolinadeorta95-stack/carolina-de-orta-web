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

export type NewsItem = {
  id: string
  title: string
  excerpt: string | null
  content: string | null
  category: string | null
  cover_image: string | null
  video_url: string | null
  media_type: string | null
  published_at: string | null
}

type SiteSettings = {
  brandName?: string
  logoUrl?: string
  heroImageUrl?: string
  heroTitle?: string
  heroDescription?: string
  introTitle?: string; introLead?: string; introLink?: string; propertiesTitle?: string; propertiesLink?: string; projectsTitle?: string; projectsDescription?: string; projectsLink?: string; journalTitle?: string; journalLink?: string; aboutTitle?: string; aboutLead?: string; aboutDescription?: string; aboutImageUrl?: string; contactTitle?: string; contactDescription?: string; contactEmail?: string; instagramUrl?: string; linkedinUrl?: string; whatsappUrl?: string;   footerRole?: string
  heroImagesJson?: string
  heroKicker?: string
  heroCta?: string
  introKicker?: string; propertiesKicker?: string; projectsKicker?: string; journalKicker?: string; aboutKicker?: string; contactKicker?: string
  introCta?: string; propertiesCta?: string; projectsCta?: string; journalCta?: string; aboutCta?: string; projectImagesJson?: string; menuProperties?: string; menuProjects?: string; menuJournal?: string; menuAbout?: string; menuContact?: string; contactInstagram?: string; contactLinkedin?: string; contactWhatsapp?: string; footerBrand?: string; footerAddress?: string; footerLegal?: string; footerCredit?: string
}

export default async function Page() {
  let properties: Property[] = []
  let news: NewsItem[] = []
  const settings: SiteSettings = {}

  try {
    const supabase = await createClient()
    const [{ data: propertyData, error: propertyError }, { data: settingData, error: settingsError }, { data: newsData, error: newsError }] = await Promise.all([
      supabase.from('properties').select('id, title, location, price, area, description, status, cover_image').eq('published', true).order('created_at', { ascending: false }),
      supabase.from('site_settings').select('key, value'),
      supabase.from('news').select('id, title, excerpt, content, category, cover_image, video_url, media_type, published_at').eq('status', 'published').order('published_at', { ascending: false }),
    ])

    if (propertyError) console.error('[v0] Properties load error:', propertyError.message)
    else properties = propertyData ?? []
    if (newsError) console.error('[v0] News load error:', newsError.message)
    else news = newsData ?? []
    if (settingsError) console.error('[v0] site_settings load error:', settingsError.message)

    const allowedKeys = new Set<keyof SiteSettings>(['brandName', 'logoUrl', 'heroImageUrl', 'heroTitle', 'heroDescription', 'introTitle', 'introLead', 'introLink', 'propertiesTitle', 'propertiesLink', 'projectsTitle', 'projectsDescription', 'projectsLink', 'journalTitle', 'journalLink', 'aboutTitle', 'aboutLead', 'aboutDescription', 'aboutImageUrl', 'contactTitle', 'contactDescription', 'contactEmail', 'instagramUrl', 'linkedinUrl', 'whatsappUrl', 'footerRole', 'heroImagesJson', 'heroKicker', 'heroCta', 'introKicker', 'propertiesKicker', 'projectsKicker', 'journalKicker', 'aboutKicker', 'contactKicker', 'introCta', 'propertiesCta', 'projectsCta', 'journalCta', 'aboutCta', 'projectImagesJson', 'menuProperties', 'menuProjects', 'menuJournal', 'menuAbout', 'menuContact', 'contactInstagram', 'contactLinkedin', 'contactWhatsapp', 'footerBrand', 'footerAddress', 'footerLegal', 'footerCredit'])
    for (const setting of settingData ?? []) {
      if (allowedKeys.has(setting.key as keyof SiteSettings)) settings[setting.key as keyof SiteSettings] = setting.value
    }
  } catch (error) {
    console.error('[v0] Public site data load error:', error)
  }

  return <SiteHome properties={properties} news={news} settings={settings} />
}
