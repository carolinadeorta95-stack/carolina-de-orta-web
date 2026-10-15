'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'
import { WhatsAppFloat } from './whatsapp-float'

type Property = {
  id: string; property_code?: string | null; title: string; location: string; address?: string | null; neighborhood?: string | null; city?: string | null; province?: string | null; price: string | number | null; description?: string | null; status?: string | null; operation_type?: string | null; property_type?: string | null; featured?: boolean | null; bedrooms?: number | null; bathrooms?: number | null; garages?: number | null; covered_area_m2?: number | null; land_area_m2?: number | null; latitude?: number | null; longitude?: number | null; cover_image?: string | null
}
type PropertyImage = { id: string; property_id: string; image_url: string; is_cover: boolean; sort_order: number }

function displayPrice(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 'Consultar precio'
  const text = String(value).trim()
  return !text || /nan|undefined/i.test(text) ? 'Consultar precio' : text
}

function displayArea(value: number | null | undefined) {
  return value === null || value === undefined ? null : `${value} m²`
}

export default function PropertyDetail({ property, images, whatsappUrl, footerBrand, footerRole, logoUrl }: { property: Property; images: PropertyImage[]; whatsappUrl?: string; footerBrand?: string; footerRole?: string; logoUrl?: string }) {
  const orderedImages = [...images].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
  const gallery = orderedImages.length ? orderedImages : property.cover_image ? [{ id: 'cover', property_id: property.id, image_url: property.cover_image, is_cover: true, sort_order: 0 }] : []
  const [active, setActive] = useState(0)
  const current = gallery[active]
  const location = Array.from(new Set([property.neighborhood, property.city, property.province, property.location].filter(Boolean).map((value) => String(value).trim()))).join(' · ')
  const facts = [['Dormitorios', property.bedrooms], ['Baños', property.bathrooms], ['Cocheras', property.garages], ['Sup. cubierta', displayArea(property.covered_area_m2)], ['Sup. terreno', displayArea(property.land_area_m2)]].filter(([, value]) => value !== null && value !== undefined && value !== '')
  const mapsQuery = property.latitude != null && property.longitude != null ? `${property.latitude},${property.longitude}` : [property.address, location].filter(Boolean).join(', ')
  const mapsUrl = mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}` : null

  return <main className="site-shell property-detail-page">
    <header className="site-header"><Link className="brand" href="/" aria-label="Carolina de Orta, inicio">{logoUrl ? <Image className="brand-logo" src={logoUrl} alt="Carolina de Orta" width={180} height={54} priority /> : <span>Carolina de Orta</span>}</Link><nav className="main-nav" aria-label="Navegación principal"><Link href="/">Inicio</Link><Link href="/propiedades">Propiedades</Link><Link href="/#proyectos">Proyectos</Link><Link href="/#contacto">Contacto</Link></nav></header>
    <section className="property-detail-hero section-pad"><div className="property-detail-gallery"><Link className="property-detail-back-overlay" href="/propiedades" aria-label="Volver al catálogo de propiedades"><ArrowLeft size={20} /></Link>{current ? <Image src={current.image_url} alt={`${property.title} - imagen ${active + 1}`} fill priority sizes="(max-width: 800px) 100vw, 62vw" /> : <div className="property-detail-empty">Sin imágenes disponibles</div>} {gallery.length > 1 && <><button className="gallery-arrow gallery-prev" aria-label="Imagen anterior" onClick={() => setActive((active - 1 + gallery.length) % gallery.length)}><ArrowLeft size={18} /></button><button className="gallery-arrow gallery-next" aria-label="Imagen siguiente" onClick={() => setActive((active + 1) % gallery.length)}><ArrowRight size={18} /></button></>}</div>{gallery.length > 1 && <div className="property-detail-thumbs">{gallery.map((image, index) => <button key={image.id} className={index === active ? 'active' : ''} aria-label={`Ver imagen ${index + 1}`} onClick={() => setActive(index)}><Image src={image.image_url} alt="" fill sizes="90px" /></button>)}</div>}</section>
    <section className="property-detail-content section-pad"><Link className="property-detail-back text-link" href="/propiedades"><ArrowLeft size={14} /> Volver a propiedades</Link><div className="property-detail-heading"><div><p className="section-kicker">{property.operation_type || 'PROPIEDAD'} · {property.property_type || 'INMUEBLE'}</p><h1>{property.title}</h1><p className="property-detail-location">{location}</p>{mapsUrl && <a className="text-link property-map-link" href={mapsUrl} target="_blank" rel="noreferrer">Ver ubicación en Google Maps <ArrowRight size={16} /></a>}</div>{property.featured && <span className="featured-badge"><Star size={14} /> Destacada</span>}</div><div className="property-detail-summary"><span>{property.operation_type || 'Operación'}</span><strong>{displayPrice(property.price)}</strong>{property.status && <span>{property.status}</span>}</div>{facts.length > 0 && <div className="property-facts" aria-label="Características de la propiedad">{facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}{property.description && <div className="property-description"><p className="eyebrow">DESCRIPCIÓN</p><p>{property.description}</p></div>}</section>
    <WhatsAppFloat url={whatsappUrl} /><footer className="site-footer"><span>© {new Date().getFullYear()} {footerBrand || 'CAROLINA DE ORTA'}</span><span>{footerRole || 'LIC. EN ECONOMÍA · MARTILLERA PÚBLICA'}</span><Link href="/propiedades">Volver al catálogo ↑</Link></footer>
  </main>
}
