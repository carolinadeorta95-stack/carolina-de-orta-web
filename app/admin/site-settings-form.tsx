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
  heroImagesJson: string
  projectImagesJson: string
  introKicker: string
  propertiesKicker: string
  projectsKicker: string
  journalKicker: string
  aboutKicker: string
  contactKicker: string
  heroCta: string
  introCta: string
  propertiesCta: string
  projectsCta: string
  journalCta: string
  aboutCta: string
  contactCta: string
  heroKicker: string
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
  contactTitle: 'Hagamos lugar a una conversación.', contactDescription: 'Si estás pensando en comprar, vender o invertir en Patagonia, escribime.', contactEmail: 'hola@carolinadeorta.com', instagramUrl: '', linkedinUrl: '', whatsappUrl: '', footerRole: 'LIC. EN ECONOMÍA · MARTILLERA PÚBLICA', projectImageUrl: '', journalCoverUrl: '', journalVideoUrl: '', heroImagesJson: '[]', projectImagesJson: '[]', introKicker: '01 / UNA MIRADA PROPIA', propertiesKicker: '02 / PROPIEDADES', projectsKicker: '03 / PROYECTOS', journalKicker: '04 / ACTUALIDAD', aboutKicker: '05 / SOBRE MÍ', contactKicker: '06 / CONTACTO', heroKicker: 'REAL ESTATE · ECONOMÍA · PATAGONIA', heroCta: 'Explorar propiedades', introCta: 'Conocer más sobre mí', propertiesCta: 'Ver todas', projectsCta: 'Conocer proyectos', journalCta: 'Ver actualidad', aboutCta: 'Hablemos', contactCta: 'Escribime',
}

export type CmsSection = 'portada' | 'introduccion' | 'proyectos' | 'actualidad' | 'sobre-mi'

export default function SiteSettingsForm({ initialValues, section }: { initialValues?: Partial<SiteSettings>; section: CmsSection }) {
  const [settings, setSettings] = useState({ ...initialSettings, ...initialValues })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(initialValues?.logoUrl || '')
  const [heroPreview, setHeroPreview] = useState(initialValues?.heroImageUrl || initialSettings.heroImageUrl)
  const [contentFile, setContentFile] = useState<File | null>(null)
  const [contentFiles, setContentFiles] = useState<File[]>([])
  const [contentFileKind, setContentFileKind] = useState<'aboutImageUrl' | 'projectImageUrl' | 'journalCoverUrl' | 'journalVideoUrl' | 'heroImagesJson' | 'projectImagesJson' | null>(null)
  const [message, setMessage] = useState('')

  function update(field: keyof SiteSettings, value: string) {
    setSettings((current) => ({ ...current, [field]: value }))
    setMessage('')
  }

  function imageList(key: 'heroImagesJson' | 'projectImagesJson') { try { return JSON.parse(settings[key] || '[]') as string[] } catch { return [] } }
  function updateImageList(key: 'heroImagesJson' | 'projectImagesJson', next: string[]) { update(key, JSON.stringify(next)) }
  function removeImage(key: 'heroImagesJson' | 'projectImagesJson', index: number) { const next = imageList(key); next.splice(index, 1); updateImageList(key, next) }
  function moveImage(key: 'heroImagesJson' | 'projectImagesJson', index: number, direction: -1 | 1) { const next = imageList(key); const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; updateImageList(key, next) }

  async function persistSetting(key: keyof SiteSettings, value: string) {
    const supabase = createClient()
    const { data: existing, error: lookupError } = await supabase.from('site_settings').select('id').eq('key', key).maybeSingle()
    if (lookupError) throw lookupError
    const result = existing
      ? await supabase.from('site_settings').update({ value }).eq('id', existing.id)
      : await supabase.from('site_settings').insert({ id: crypto.randomUUID(), key, value })
    if (result.error) throw result.error
  }

  async function selectHeroRotationFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    setMessage('Subiendo imágenes de portada...')
    try {
      const existing = imageList('heroImagesJson')
      const uploaded = await Promise.all(files.map((file) => uploadContentFile(file, 'hero-rotation')))
      const next = [...existing, ...uploaded]
      const value = JSON.stringify(next)
      setSettings((current) => ({ ...current, heroImagesJson: value }))
      await persistSetting('heroImagesJson', value)
      setMessage(`${uploaded.length} imagen${uploaded.length === 1 ? '' : 'es'} agregada${uploaded.length === 1 ? '' : 's'} a la rotación.`)
    } catch (error) {
      setMessage(`Error subiendo imágenes: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      event.target.value = ''
    }
  }

  function selectContentFile(kind: NonNullable<typeof contentFileKind>, event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    if (kind === 'heroImagesJson') { void selectHeroRotationFiles(event); return }
    if (kind === 'projectImagesJson') { setContentFiles(files); setContentFileKind(kind) }
    else { setContentFile(files[0]); setContentFileKind(kind) }
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
      if (contentFileKind === 'heroImagesJson' || contentFileKind === 'projectImagesJson') {
        const existing = JSON.parse(settings[contentFileKind] || '[]') as string[]
        const uploaded = await Promise.all(contentFiles.map((file) => uploadContentFile(file, contentFileKind)))
        settings[contentFileKind] = JSON.stringify([...existing, ...uploaded])
      } else if (contentFile && contentFileKind) {
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
    portada: ['brandName', 'heroTitle', 'heroDescription', 'heroCta', 'heroKicker'],
    introduccion: ['introKicker', 'introTitle', 'introLead', 'introCta'],
    proyectos: ['projectsKicker', 'projectsTitle', 'projectsDescription', 'projectsCta'],
    actualidad: ['journalKicker', 'journalTitle', 'journalCta'],
    'sobre-mi': ['aboutKicker', 'aboutTitle', 'aboutLead', 'aboutDescription', 'aboutCta', 'footerRole'],
  } as const
  const activeFields = sectionFields[section]
  const textFields = ([['heroKicker', 'Bajada hero'], ['heroTitle', 'Título hero'], ['heroDescription', 'Descripción hero'], ['heroCta', 'CTA hero'], ['introKicker', 'Kicker introducción'], ['introTitle', 'Título'], ['introLead', 'Presentación'], ['introCta', 'CTA'], ['projectsKicker', 'Kicker proyectos'], ['projectsTitle', 'Título'], ['projectsDescription', 'Descripción'], ['projectsCta', 'CTA'], ['journalKicker', 'Kicker actualidad'], ['journalTitle', 'Título'], ['journalCta', 'CTA'], ['aboutKicker', 'Kicker sobre mí'], ['aboutTitle', 'Título'], ['aboutLead', 'Bajada'], ['aboutDescription', 'Descripción'], ['aboutCta', 'CTA'], ['footerRole', 'Texto del pie']] as const).filter(([field]) => activeFields.includes(field as never))

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
          <label className="hero-media-slot">Imagen principal / hero<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectImage('hero', event)} /><small className="admin-help">Subir imagen a Media.</small>{heroPreview && <img className="admin-image-preview" src={heroPreview} alt="Vista previa hero" />}</label>
          <label className="dropzone hero-media-slot">Agregar imágenes a la rotación<input type="file" accept="image/*" multiple onChange={selectHeroRotationFiles} /><small className="admin-help">Se suben automáticamente a Media al seleccionarlas.</small></label>
          <small className="admin-help">Las imágenes se guardan en Media y se muestran en rotación automática.</small><div className="gallery-grid">{imageList('heroImagesJson').map((url, index) => <div className="gallery-card" key={`${url}-${index}`}><img src={url} alt={`Imagen de portada ${index + 1}`} /><div><button type="button" onClick={() => moveImage('heroImagesJson', index, -1)}>↑</button><button type="button" onClick={() => moveImage('heroImagesJson', index, 1)}>↓</button><button type="button" onClick={() => removeImage('heroImagesJson', index)}>Eliminar</button></div></div>)}</div>
        </>}
        {section === 'sobre-mi' && <label>Fotografía<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectContentFile('aboutImageUrl', event)} /><small className="admin-help">Subir fotografía a Media.</small></label>}
        {textFields.map(([field, label]) => <label key={field} className={field.endsWith('Description') || field.endsWith('Lead') || field.endsWith('Title') ? 'full-field' : ''}>{label}{field.endsWith('Description') || field.endsWith('Lead') ? <textarea rows={4} value={settings[field]} onChange={(event) => update(field, event.target.value)} /> : <input value={settings[field]} onChange={(event) => update(field, event.target.value)} />}</label>)}
        {section === 'proyectos' && <><div className="admin-subsection"><h3>Imágenes de proyectos</h3></div><label className="dropzone">Subir imágenes a Media<input type="file" accept="image/*" multiple onChange={(event) => selectContentFile('projectImagesJson', event)} /></label><div className="gallery-grid">{imageList('projectImagesJson').map((url, index) => <div className="gallery-card" key={`${url}-${index}`}><img src={url} alt={`Imagen de proyecto ${index + 1}`} /><div><button type="button" onClick={() => moveImage('projectImagesJson', index, -1)}>↑</button><button type="button" onClick={() => moveImage('projectImagesJson', index, 1)}>↓</button><button type="button" onClick={() => removeImage('projectImagesJson', index)}>Eliminar</button></div></div>)}</div></>}
        {section === 'actualidad' && <><div className="admin-subsection"><h3>Publicaciones</h3><p className="admin-help">Arquitectura preparada para títulos, bajadas, contenido, fecha, categoría, estado, imagen y video.</p></div><label>Imagen de portada<input type="file" accept="image/*" onChange={(event) => selectContentFile('journalCoverUrl', event)} /></label><label>Video<input type="file" accept="video/*" onChange={(event) => selectContentFile('journalVideoUrl', event)} /></label><label>Título<input value={settings.journalTitle} onChange={(event) => update('journalTitle', event.target.value)} /></label></>}
        <div className="form-actions"><button className="admin-button" type="submit">Guardar {sectionLabels[section]}</button>{message && <span className="admin-success">{message}</span>}</div>
      </form>
    </section>
  )
}
