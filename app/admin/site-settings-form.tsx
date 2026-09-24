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
}

const initialSettings: SiteSettings = {
  brandName: 'Carolina de Orta',
  logoUrl: '',
  heroImageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2200&q=90',
  heroTitle: 'Donde el territorio se vuelve decisión.',
  heroDescription: 'Una mirada profesional sobre propiedades, proyectos e inversiones en Patagonia Argentina.',
  primaryColor: '#111111',
  accentColor: '#f5f5f3',
}

export default function SiteSettingsForm({ initialValues }: { initialValues?: Partial<SiteSettings> }) {
  const [settings, setSettings] = useState({ ...initialSettings, ...initialValues })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(initialValues?.logoUrl || '')
  const [heroPreview, setHeroPreview] = useState(initialValues?.heroImageUrl || initialSettings.heroImageUrl)
  const [message, setMessage] = useState('')

  function update(field: keyof SiteSettings, value: string) {
    setSettings((current) => ({ ...current, [field]: value }))
    setMessage('')
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
    const { data, error } = await supabase.storage.from('site-assets').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

    if (error) throw error
    if (!data?.path) throw new Error('Supabase Storage no devolvió el path del archivo subido.')

    const { data: publicUrl } = supabase.storage.from('site-assets').getPublicUrl(data.path)
    if (!publicUrl?.publicUrl) throw new Error('Supabase Storage no devolvió una URL pública.')
    return publicUrl.publicUrl
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Guardando configuración...')

    try {
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
      const { data: existing, error: lookupError } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle()

      if (lookupError) {
        setMessage('No se pudo guardar la configuración. Revisá la conexión e intentá nuevamente.')
        return
      }

      const result = existing
        ? await supabase.from('site_settings').update({ value }).eq('id', existing.id)
        : await supabase.from('site_settings').insert({ id: crypto.randomUUID(), key, value })

      if (result.error) {
        setMessage('No se pudo guardar la configuración. Revisá la conexión e intentá nuevamente.')
        return
      }
    }

    setMessage('Configuración guardada correctamente.')
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <p className="admin-eyebrow">IDENTIDAD</p>
          <h2>Configuración general</h2>
        </div>
        <span className="admin-panel-note">Preparado para Supabase</span>
      </div>
      <form className="property-form" onSubmit={save}>
        <label>Nombre de la marca<input value={settings.brandName} onChange={(event) => update('brandName', event.target.value)} /></label>
        <label>Logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => selectImage('logo', event)} /><small className="admin-help">Si no seleccionás un archivo, se conserva el logo actual.</small>{logoPreview && <img className="admin-image-preview admin-logo-preview" src={logoPreview} alt="Vista previa del logo" />}</label>
        <label>Imagen principal / hero<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectImage('hero', event)} /><small className="admin-help">Si no seleccionás un archivo, se conserva la imagen actual.</small>{heroPreview && <img className="admin-image-preview" src={heroPreview} alt="Vista previa de la imagen principal" />}</label>
        <label className="full-field">Título principal<input value={settings.heroTitle} onChange={(event) => update('heroTitle', event.target.value)} /></label>
        <label className="full-field">Frase principal<textarea rows={3} value={settings.heroDescription} onChange={(event) => update('heroDescription', event.target.value)} /></label>
        <label>Color principal<input type="text" value={settings.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} /></label>
        <label>Color de fondo<input type="text" value={settings.accentColor} onChange={(event) => update('accentColor', event.target.value)} /></label>
        <div className="form-actions"><button className="admin-button" type="submit">Guardar configuración</button>{message && <span className="admin-success">{message}</span>}</div>
      </form>
    </section>
  )
}
