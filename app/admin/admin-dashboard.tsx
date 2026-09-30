'use client'

import { FormEvent, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import SiteSettingsForm from './site-settings-form'

type Property = {
  id: string
  property_code?: string | null
  title: string
  location: string
  address?: string | null
  neighborhood?: string | null
  city?: string | null
  province?: string | null
  price: string | number
  area: string | number
  description: string | null
  status: string | null
  cover_image: string | null
  operation_type?: string | null
  property_type?: string | null
  featured?: boolean | null
  published?: boolean | null
  bedrooms?: number | null
  bathrooms?: number | null
  garages?: number | null
  covered_area_m2?: number | null
  land_area_m2?: number | null
  latitude?: number | null
  longitude?: number | null
  location_precision?: string | null
}

type ImageRow = { id: string; property_id: string; image_url: string; storage_path: string; is_cover: boolean; sort_order: number }
type FormState = Omit<Property, 'id' | 'cover_image'> & { cover_image: string }
type SiteSettings = { brandName: string; logoUrl: string; heroImageUrl: string; heroTitle: string; heroDescription: string; primaryColor: string; accentColor: string }

const empty: FormState = { property_code: '', title: '', location: '', address: '', neighborhood: '', city: '', province: '', price: '', area: '', description: '', status: 'Disponible', cover_image: '', operation_type: 'Venta', property_type: 'Casa', featured: false, published: true, bedrooms: null, bathrooms: null, garages: null, covered_area_m2: null, land_area_m2: null, latitude: null, longitude: null, location_precision: 'approximate' }

const fields = [
  ['title', 'Título', 'text'], ['property_code', 'Código de propiedad', 'text'], ['operation_type', 'Operación', 'text'], ['property_type', 'Tipo de propiedad', 'text'],
  ['address', 'Dirección', 'text'], ['neighborhood', 'Barrio / localidad', 'text'], ['city', 'Ciudad', 'text'], ['province', 'Provincia', 'text'], ['price', 'Precio', 'number'],
  ['bedrooms', 'Dormitorios', 'number'], ['bathrooms', 'Baños', 'number'], ['garages', 'Cocheras', 'number'], ['covered_area_m2', 'Superficie cubierta (m²)', 'number'], ['land_area_m2', 'Superficie terreno (m²)', 'number'],
] as const

export default function AdminDashboard({ email, initialProperties, initialImages, initialSettings }: { email: string; initialProperties: Property[]; initialImages: ImageRow[]; initialSettings: Partial<SiteSettings> }) {
  const router = useRouter()
  const [properties, setProperties] = useState(initialProperties)
  const [images, setImages] = useState(initialImages)
  const [form, setForm] = useState<FormState>(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'properties' | 'editor'>('properties')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const currentImages = useMemo(() => images.filter((image) => image.property_id === editing).sort((a, b) => a.sort_order - b.sort_order), [images, editing])
  const setField = (field: keyof FormState, value: string | number | boolean | null) => setForm((current) => ({ ...current, [field]: value }))

  function edit(property: Property) {
    setEditing(property.id)
    setForm({ ...empty, ...property, property_code: property.property_code ?? '', cover_image: property.cover_image ?? '', title: property.title ?? '', location: property.location ?? '', description: property.description ?? '' })
    setMessage('')
    setPendingFiles([])
    setActiveTab('editor')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function reset() { setEditing(null); setForm(empty); setPendingFiles([]); setMessage('') }
  function duplicate(property: Property) { setEditing(null); setForm({ ...empty, ...property, property_code: '', title: `${property.title} — copia`, cover_image: property.cover_image ?? '' }); setActiveTab('editor'); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  async function uploadFiles(propertyId: string, files: File[]) {
    const supabase = createClient()
    const start = currentImages.length
    const uploaded: ImageRow[] = []
    for (const [index, file] of files.entries()) {
      const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
      const path = `properties/${propertyId}/${crypto.randomUUID()}.${extension}`
      const upload = await supabase.storage.from('Media').upload(path, file, { upsert: false, contentType: file.type || 'image/jpeg' })
      if (upload.error) throw upload.error
      const url = supabase.storage.from('Media').getPublicUrl(path).data.publicUrl
      const result = await supabase.from('property_images').insert({ property_id: propertyId, image_url: url, storage_path: path, is_cover: start === 0 && index === 0, sort_order: start + index }).select().single()
      if (result.error) throw result.error
      uploaded.push(result.data)
    }
    setImages((current) => [...current, ...uploaded])
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('Guardando propiedad…')
    const supabase = createClient()
    const payload = { ...form, price: String(form.price) === '' ? null : Number(form.price), area: String(form.area) === '' ? null : Number(form.area), bedrooms: String(form.bedrooms) === '' ? null : form.bedrooms, bathrooms: String(form.bathrooms) === '' ? null : form.bathrooms, garages: String(form.garages) === '' ? null : form.garages, covered_area_m2: String(form.covered_area_m2) === '' ? null : form.covered_area_m2, land_area_m2: String(form.land_area_m2) === '' ? null : form.land_area_m2 }
    const result = editing ? await supabase.from('properties').update(payload).eq('id', editing).select().single() : await supabase.from('properties').insert(payload).select().single()
    if (result.error) { setSaving(false); setMessage(`No se pudo guardar: ${result.error.message}`); return }
    try { if (pendingFiles.length) await uploadFiles(result.data.id, pendingFiles) } catch (error) { setSaving(false); setMessage(`Propiedad guardada, pero falló la galería: ${error instanceof Error ? error.message : 'error de Storage'}`); return }
    setProperties((items) => editing ? items.map((item) => item.id === editing ? result.data : item) : [result.data, ...items])
    setPendingFiles([]); setSaving(false); setMessage('Propiedad guardada correctamente.'); setEditing(result.data.id); setForm({ ...empty, ...result.data, cover_image: result.data.cover_image ?? '' })
    router.refresh()
  }

  async function remove(id: string) { if (!window.confirm('¿Eliminar esta propiedad y sus imágenes?')) return; const { error } = await createClient().from('properties').delete().eq('id', id); if (!error) setProperties((items) => items.filter((item) => item.id !== id)); else setMessage(`No se pudo eliminar: ${error.message}`) }
  async function signOut() { await createClient().auth.signOut(); router.replace('/'); router.refresh() }
  function addFiles(list: FileList | null) { if (list) setPendingFiles((current) => [...current, ...Array.from(list).filter((file) => file.type.startsWith('image/'))]) }
  async function setCover(image: ImageRow) { if (!editing) return; const supabase = createClient(); await supabase.from('property_images').update({ is_cover: false }).eq('property_id', editing); await supabase.from('property_images').update({ is_cover: true }).eq('id', image.id); setImages((current) => current.map((item) => item.property_id === editing ? { ...item, is_cover: item.id === image.id } : item)) }
  async function deleteImage(image: ImageRow) { if (!window.confirm('¿Eliminar esta imagen?')) return; const supabase = createClient(); const { error } = await supabase.from('property_images').delete().eq('id', image.id); if (!error) setImages((current) => current.filter((item) => item.id !== image.id)); else setMessage(`No se pudo eliminar la imagen: ${error.message}`) }
  async function moveImage(index: number, direction: -1 | 1) { const next = index + direction; if (next < 0 || next >= currentImages.length || !editing) return; const ordered = [...currentImages]; [ordered[index], ordered[next]] = [ordered[next], ordered[index]]; const supabase = createClient(); await Promise.all(ordered.map((image, sort_order) => supabase.from('property_images').update({ sort_order }).eq('id', image.id))); setImages((current) => current.map((item) => { const order = ordered.findIndex((image) => image.id === item.id); return order >= 0 ? { ...item, sort_order: order } : item })) }

  return <main className="admin-shell"><header className="admin-header"><a className="admin-brand" href="/">CAROLINA<br />DE ORTA</a><div><p className="admin-eyebrow">PANEL PRIVADO</p><span className="admin-muted">{email}</span></div><button className="admin-link-button" onClick={signOut}>Cerrar sesión</button></header><div className="admin-content"><SiteSettingsForm initialValues={initialSettings} /><div className="admin-title-row"><div><p className="admin-eyebrow">CONTENIDO</p><h1>Propiedades</h1><p className="admin-muted">Administrá cada ficha, galería y ubicación sin tocar el diseño público.</p></div><a className="admin-outline" href="/">Ver sitio</a></div><div className="admin-tabs"><button className={activeTab === 'properties' ? 'is-active' : ''} onClick={() => setActiveTab('properties')}>Listado</button><button className={activeTab === 'editor' ? 'is-active' : ''} onClick={() => setActiveTab('editor')}>{editing ? 'Editar propiedad' : 'Nueva propiedad'}</button></div>{activeTab === 'properties' ? <section className="admin-panel admin-table-panel"><div className="admin-panel-heading"><div><h2>Propiedades existentes</h2><p className="admin-panel-note">{properties.length} registros sincronizados con Supabase.</p></div><button className="admin-button" onClick={() => { reset(); setActiveTab('editor') }}>Nueva propiedad</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Código</th><th>Propiedad</th><th>Operación / tipo</th><th>Ubicación</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{properties.map((property) => <tr key={property.id}><td><strong>{property.property_code || '—'}</strong></td><td>{property.title}<small>{property.featured ? 'Destacada' : ''} {property.published === false ? 'Borrador' : ''}</small></td><td>{property.operation_type || property.status || '—'}<small>{property.property_type || '—'}</small></td><td>{property.location || [property.city, property.province].filter(Boolean).join(', ') || '—'}</td><td>{property.price ? `$ ${Number(property.price).toLocaleString('es-AR')}` : '—'}</td><td><span className={`admin-status ${property.published === false ? 'draft' : 'published'}`}>{property.published === false ? 'Borrador' : 'Publicada'}</span></td><td><div className="admin-row-actions"><button onClick={() => edit(property)}>Editar</button><button onClick={() => duplicate(property)}>Duplicar</button><a href={`/?property=${property.id}`} target="_blank" rel="noreferrer">Previsualizar</a><button onClick={() => remove(property.id)}>Eliminar</button></div></td></tr>)}</tbody></table>{!properties.length && <p className="admin-empty">Todavía no hay propiedades cargadas.</p>}</div></section> : <section className="admin-panel"><h2>{editing ? 'Editar propiedad' : 'Nueva propiedad'} <span>{editing ? `· ${form.property_code || 'sin código'}` : ''}</span></h2><form className="property-form pro-form" onSubmit={save}><div className="pro-field-grid">{fields.map(([field, label, type]) => <label key={field}>{label}<input type={type} value={String(form[field] ?? '')} onChange={(event) => setField(field, type === 'number' ? (event.target.value === '' ? null : Number(event.target.value)) : event.target.value)} required={field === 'title'} /></label>)}</div><label>Descripción<textarea rows={5} value={form.description ?? ''} onChange={(event) => setField('description', event.target.value)} /></label><div className="pro-switches"><label><input type="checkbox" checked={Boolean(form.published)} onChange={(event) => setField('published', event.target.checked)} /> Publicada</label><label><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setField('featured', event.target.checked)} /> Destacada</label></div><div className="admin-subsection"><div className="admin-panel-heading"><div><h3>Ubicación</h3><p className="admin-panel-note">Sin API de Google: guardá coordenadas y ajustá el pin visualmente.</p></div></div><div className="pro-location-grid"><label>Latitud<input type="number" step="any" value={String(form.latitude ?? '')} onChange={(event) => setField('latitude', event.target.value === '' ? null : Number(event.target.value))} /></label><label>Longitud<input type="number" step="any" value={String(form.longitude ?? '')} onChange={(event) => setField('longitude', event.target.value === '' ? null : Number(event.target.value))} /></label><label>Precisión<select value={form.location_precision ?? 'approximate'} onChange={(event) => setField('location_precision', event.target.value)}><option value="exact">Exacta</option><option value="approximate">Aproximada</option></select></label></div><div className="coordinate-map"><span>Mapa preparado</span><b>{form.latitude ?? '—'}, {form.longitude ?? '—'}</b><i /></div></div><div className="admin-subsection"><div className="admin-panel-heading"><div><h3>Galería de fotos</h3><p className="admin-panel-note">Media · arrastrá imágenes o seleccioná varias. Las imágenes nuevas se suben al guardar.</p></div></div><label className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}>Soltá imágenes acá o <span>seleccioná archivos<input type="file" multiple accept="image/*" onChange={(event) => addFiles(event.target.files)} /></span></label>{pendingFiles.length > 0 && <p className="admin-panel-note">{pendingFiles.length} imagen{pendingFiles.length === 1 ? '' : 'es'} preparadas para subir.</p>}<div className="gallery-grid">{currentImages.map((image, index) => <div key={image.id} className="gallery-card" draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex !== null) moveImage(dragIndex, index > dragIndex ? 1 : -1); setDragIndex(null) }}><img src={image.image_url} alt="" /><div><button type="button" onClick={() => setCover(image)}>{image.is_cover ? 'Portada' : 'Hacer portada'}</button><button type="button" onClick={() => moveImage(index, -1)}>←</button><button type="button" onClick={() => moveImage(index, 1)}>→</button><button type="button" onClick={() => deleteImage(image)}>Eliminar</button></div></div>)}</div></div><div className="form-actions"><button className="admin-button" type="submit" disabled={saving}>{saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear propiedad'}</button><button className="admin-cancel" type="button" onClick={() => { reset(); setActiveTab('properties') }}>Cancelar</button>{message && <span className="form-message">{message}</span>}</div></form></section>}</div></main>
}
