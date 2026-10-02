'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type SiteSettings = {
  brandName: string
  logoUrl: string
  heroImageUrl: string
  heroTitle: string
  heroDescription: string
  primaryColor: string
  accentColor: string
  introTitle: string
  introLead: string
  introLink: string
  propertiesTitle: string
  propertiesLink: string
  projectsTitle: string
  projectsDescription: string
  projectsLink: string
  journalTitle: string
  journalLink: string
  aboutTitle: string
  aboutLead: string
  aboutDescription: string
  aboutImageUrl: string
  contactTitle: string
  contactDescription: string
  contactEmail: string
  instagramUrl: string
  linkedinUrl: string
  whatsappUrl: string
  footerRole: string
  projectImageUrl: string
  journalCoverUrl: string
  journalVideoUrl: string
}

const initialSettings: SiteSettings = {
  brandName: 'Carolina de Orta',
  logoUrl: '',
  heroImageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2200&q=90',
  heroTitle: 'Donde el territorio se vuelve decisión.',
  heroDescription: 'Una mirada profesional sobre propiedades, proyectos e inversiones en Patagonia Argentina.',
  primaryColor: '#111111',
  accentColor: '#f5f5f3',
  introTitle: 'Patagonia, con criterio.', introLead: 'Soy Carolina de Orta, Licenciada en Economía y Martillera Pública. Acompaño decisiones inmobiliarias con análisis, conocimiento del territorio y una perspectiva de largo plazo.', introLink: 'Conocer más sobre mí',
  propertiesTitle: 'Espacios para habitar.', propertiesLink: 'Ver todas', projectsTitle: 'Ideas que toman forma.', projectsDescription: 'Desarrollos seleccionados y oportunidades para invertir en un territorio con identidad, crecimiento y horizonte.', projectsLink: 'Conocer proyectos',
  journalTitle: 'Notas sobre el territorio.', journalLink: 'Ver actualidad', aboutTitle: 'Una forma de mirar.', aboutLead: 'La economía y el real estate se encuentran en una misma pregunta: ¿qué hace que un lugar tenga valor?', aboutDescription: 'Mi trabajo parte de escuchar, observar y traducir información compleja en decisiones claras. Con San Martín de los Andes y la Patagonia como territorio de estudio y pertenencia.', aboutImageUrl: '',
  contactTitle: 'Hagamos lugar a una conversación.', contactDescription: 'Si estás pensando en comprar, vender o invertir en Patagonia, escribime.', contactEmail: 'hola@carolinadeorta.com', instagramUrl: '', linkedinUrl: '', whatsappUrl: '', footerRole: 'LIC. EN ECONOMÍA · MARTILLERA PÚBLICA', projectImageUrl: '', journalCoverUrl: '', journalVideoUrl: '',
}

export type CmsSection = 'portada' | 'introduccion' | 'proyectos' | 'actualidad' | 'sobre-mi'

export default function SiteSettingsForm({ initialValues, section }: { initialValues?: Partial<SiteSettings>; section: CmsSection }) {
  const [settings, setSettings] = useState({ ...initialSettings, ...initialValues })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(initialValues?.logoUrl || '')
  const [heroPreview, setHeroPreview] = useState(initialValues?.heroImageUrl || initialSettings.heroImageUrl)
  const [contentFile, setContentFile] = useState<File | null>(null)
  const [contentFileKind, setContentFileKind] = useState<'aboutImageUrl' | 'projectImageUrl' | 'journalCoverUrl' | 'journalVideoUrl' | null>(null)
  const [message, setMessage] = useState('')

  function update(field: keyof SiteSettings, value: string) {
    setSettings((current) => ({ ...current, [field]: value }))
    setMessage('')
  }

  function selectContentFile(kind: NonNullable<typeof contentFileKind>, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) { setContentFile(file); setContentFileKind(kind) }
  }

  async function uploadContentFile(file: File, kind: string) {
    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
    const path = `cms/${kind}/${crypto.randomUUID()}.${extension}`
    const supabase = createClient()
    const { data, error } = await supabase.storage.from('Media').upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' })
    if (error) throw error
    return supabase.storage.from('Media').getPublicUrl(data.path).data.publicUrl
  }

  function selectImage(field: 'logo' | 'hero', event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    if (field === 'logo') {
      setLogoFile(file)
      setLogoPreview(preview)
    } else {
      setHeroFile(file)
      setHeroPreview(preview)
    }
    setMessage('')
  }

  async function uploadImage(file: File, prefix: 'logo' | 'hero') {
    if (!(file instanceof Blob) || !file.name) {
      throw new Error('El archivo seleccionado no es un File/Blob válido.')
    }

    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `${prefix}/${crypto.randomUUID()}.${extension}`
    const supabase = createClient()
    const { data, error } = await supabase.storage.from('Media').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

    if (error) throw error
    if (!data?.path) throw new Error('Supabase Storage no devolvió el path del archivo subido.')
    console.log('Uploaded path:', data.path)

    const { data: publicUrl } = supabase.storage.from('Media').getPublicUrl(data.path)
    if (!publicUrl?.publicUrl) throw new Error('Supabase Storage no devolvió una URL pública.')
    console.log('Generated public URL:', publicUrl.publicUrl)
    return publicUrl.publicUrl
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Guardando configuración...')

    try {
      if (contentFile && contentFileKind) {
        const uploadedUrl = await uploadContentFile(contentFile, contentFileKind)
        settings[contentFileKind] = uploadedUrl
      }
      if (logoFile) {
        const logoUrl = await uploadImage(logoFile, 'logo')
        setSettings((current) => ({ ...current, logoUrl }))
        settings.logoUrl = logoUrl
      }
      if (heroFile) {
        const heroImageUrl = await uploadImage(heroFile, 'hero')
        setSettings((current) => ({ ...current, heroImageUrl }))
        settings.heroImageUrl = heroImageUrl
      }
    } catch (error) {
      const storageError = error as {
        message?: string
        name?: string
        status?: number | string
        statusCode?: number | string
        error?: unknown
      }
      const errorDetails = {
        message: storageError.message ?? String(error),
        name: storageError.name ?? '',
        status: storageError.status ?? '',
        statusCode: storageError.statusCode ?? '',
        error: storageError.error ?? '',
      }
      console.error('Storage upload error:', error)
      setMessage(`Error Storage: ${errorDetails.message} | name: ${errorDetails.name || 'n/a'} | status: ${errorDetails.status || 'n/a'} | statusCode: ${errorDetails.statusCode || 'n/a'} | error: ${String(errorDetails.error || 'n/a')}`)
      return
    }

    const supabase = createClient()
    const entries = Object.entries(settings) as [keyof SiteSettings, string][]

    for (const [key, value] of entries) {
      console.log('Saving site_settings value:', { key, value })
      const { data: existing, error: lookupError } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle()

      if (lookupError) {
        console.error('site_settings lookup error:', lookupError)
        setMessage(`Error site_settings: ${lookupError.message}`)
        return
      }

      const result = existing
        ? await supabase.from('site_settings').update({ value }).eq('id', existing.id)
        : await supabase.from('site_settings').insert({ id: crypto.randomUUID(), key, value })

      if (result.error) {
        console.error('site_settings save error:', result.error)
        setMessage(`Error site_settings: ${result.error.message}`)
        return
      }

      const { data: saved, error: verifyError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle()
      if (verifyError) {
        console.error('site_settings verify error:', verifyError)
        setMessage(`Error verificando site_settings: ${verifyError.message}`)
        return
      }
      console.log('Saved site_settings value:', { key, value: saved?.value })
    }

    setLogoFile(null)
    setHeroFile(null)
    setMessage('Configuración guardada correctamente. Recargá el Preview para ver los cambios.')
  }

  const sectionLabels = { portada: 'Portada', introduccion: 'Introducción', proyectos: 'Proyectos / oportunidades', actualidad: 'Blog / actualidad', 'sobre-mi': 'Sobre mí' }
  const sectionFields = {
    portada: ['brandName', 'logoUrl', 'heroImageUrl', 'heroTitle', 'heroDescription', 'primaryColor', 'accentColor'],
    introduccion: ['introTitle', 'introLead', 'introLink'],
    proyectos: ['projectsTitle', 'projectsDescription', 'projectsLink'],
    actualidad: ['journalTitle', 'journalLink'],
    'sobre-mi': ['aboutTitle', 'aboutLead', 'aboutDescription', 'aboutImageUrl', 'footerRole'],
  } as const
  const activeFields = sectionFields[section]
  const textFields = ([['introTitle', 'Título'], ['introLead', 'Presentación'], ['introLink', 'Botón'], ['propertiesTitle', 'Título propiedades'], ['propertiesLink', 'Botón propiedades'], ['projectsTitle', 'Título'], ['projectsDescription', 'Descripción'], ['projectsLink', 'Botón'], ['journalTitle', 'Título'], ['journalLink', 'Botón'], ['aboutTitle', 'Título'], ['aboutLead', 'Bajada'], ['aboutDescription', 'Descripción'], ['footerRole', 'Texto del pie']] as const).filter(([field]) => activeFields.includes(field as never))

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <p className="admin-eyebrow">CMS · {sectionLabels[section]}</p>
          <h2>{sectionLabels[section]}</h2>
        </div>
        <span className="admin-panel-note">Preparado para Supabase</span>
      </div>
      <form className="property-form" onSubmit={save}>
        {section === 'portada' && <>
          <label>Nombre de la marca<input value={settings.brandName} onChange={(event) => update('brandName', event.target.value)} /></label>
          <label>Logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => selectImage('logo', event)} /><small className="admin-help">Subir imagen a Media.</small>{logoPreview && <img className="admin-image-preview admin-logo-preview" src={logoPreview} alt="Vista previa del logo" />}</label>
          <label>Imagen principal / hero<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectImage('hero', event)} /><small className="admin-help">Subir imagen a Media.</small>{heroPreview && <img className="admin-image-preview" src={heroPreview} alt="Vista previa hero" />}</label>
          <label className="full-field">Título principal<input value={settings.heroTitle} onChange={(event) => update('heroTitle', event.target.value)} /></label>
          <label className="full-field">Frase principal<textarea rows={3} value={settings.heroDescription} onChange={(event) => update('heroDescription', event.target.value)} /></label>
        </>}
        {section === 'sobre-mi' && <label>Fotografía<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectContentFile('aboutImageUrl', event)} /><small className="admin-help">Subir fotografía a Media.</small></label>}
        {textFields.map(([field, label]) => <label key={field} className={field.endsWith('Description') || field.endsWith('Lead') || field.endsWith('Title') ? 'full-field' : ''}>{label}{field.endsWith('Description') || field.endsWith('Lead') ? <textarea rows={4} value={settings[field]} onChange={(event) => update(field, event.target.value)} /> : <input value={settings[field]} onChange={(event) => update(field, event.target.value)} />}</label>)}
        {section === 'proyectos' && <><div className="admin-subsection"><h3>Imágenes de proyectos</h3></div><label className="dropzone">Subir imágenes a Media<input type="file" accept="image/*" onChange={(event) => selectContentFile('projectImageUrl', event)} /></label></>}
        {section === 'actualidad' && <><div className="admin-subsection"><h3>Publicaciones</h3><p className="admin-help">Arquitectura preparada para títulos, bajadas, contenido, fecha, categoría, estado, imagen y video.</p></div><label>Imagen de portada<input type="file" accept="image/*" onChange={(event) => selectContentFile('journalCoverUrl', event)} /></label><label>Video<input type="file" accept="video/*" onChange={(event) => selectContentFile('journalVideoUrl', event)} /></label><label>Título<input value={settings.journalTitle} onChange={(event) => update('journalTitle', event.target.value)} /></label></>}
        <div className="form-actions"><button className="admin-button" type="submit">Guardar {sectionLabels[section]}</button>{message && <span className="admin-success">{message}</span>}</div>
      </form>
    </section>
  )
}
