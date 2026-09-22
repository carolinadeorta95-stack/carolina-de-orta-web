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
  const [message, setMessage] = useState('')

  function update(field: keyof SiteSettings, value: string) {
    setSettings((current) => ({ ...current, [field]: value }))
    setMessage('')
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setMessage(`Logo seleccionado: ${file.name}. La carga a Storage quedará disponible al conectar la configuración de Storage.`)
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Guardando configuración...')

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
        <label>Logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFile} /><small className="admin-help">Si no hay logo, el sitio conserva el fallback de texto.</small></label>
        <label>URL del logo<input type="url" value={settings.logoUrl} onChange={(event) => update('logoUrl', event.target.value)} placeholder="https://..." /></label>
        <label>Imagen principal / hero<input type="url" value={settings.heroImageUrl} onChange={(event) => update('heroImageUrl', event.target.value)} /></label>
        <label className="full-field">Título principal<input value={settings.heroTitle} onChange={(event) => update('heroTitle', event.target.value)} /></label>
        <label className="full-field">Frase principal<textarea rows={3} value={settings.heroDescription} onChange={(event) => update('heroDescription', event.target.value)} /></label>
        <label>Color principal<input type="text" value={settings.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} /></label>
        <label>Color de fondo<input type="text" value={settings.accentColor} onChange={(event) => update('accentColor', event.target.value)} /></label>
        <div className="form-actions"><button className="admin-button" type="submit">Guardar configuración</button>{message && <span className="admin-success">{message}</span>}</div>
      </form>
    </section>
  )
}
