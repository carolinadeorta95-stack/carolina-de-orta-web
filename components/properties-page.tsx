'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { WhatsAppFloat } from './whatsapp-float'

type Property = {
  id: string
  property_code?: string | null
  title: string
  location: string
  price: string | number | null
  area: string | number | null
  status?: string | null
  operation_type?: string | null
  property_type?: string | null
  cover_image?: string | null
}

type PropertyImage = { property_id: string; image_url: string; is_cover: boolean; sort_order: number }

function displayPrice(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '—'
  const text = String(value).trim()
  return !text || text.toLowerCase().includes('nan') || text.toLowerCase().includes('undefined') ? 'Consultar precio' : text
}

function displayArea(value: string | number | null | undefined) {
  if (value === null || value === undefined || String(value).trim() === '') return '—'
  const text = String(value).trim()
  return /m²|m2/i.test(text) ? text : `${text} m²`
}

export function PropertiesPage({ properties, images, filterOptions, whatsappUrl, kicker, title }: { properties: Property[]; images: PropertyImage[]; filterOptions?: { operations: string[]; types: string[]; zones: string[] }; whatsappUrl?: string; kicker?: string; title?: string }) {
  const [operation, setOperation] = useState('')
  const [type, setType] = useState('')
  const [zone, setZone] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const operations = filterOptions?.operations?.length ? filterOptions.operations : ['Venta', 'Alquiler']
  const types = filterOptions?.types?.length ? filterOptions.types : Array.from(new Set(properties.map((property) => property.property_type).filter(Boolean) as string[]))
  const zones = filterOptions?.zones?.length ? filterOptions.zones : Array.from(new Set(properties.map((property) => property.location).filter(Boolean)))
  const filteredProperties = useMemo(() => properties.filter((property) => {
    const numericPrice = Number(String(property.price ?? '').replace(/[^0-9.,-]/g, '').replace(/\\.(?=.*\\.)/g, '').replace(',', '.'))
    return (!operation || property.operation_type === operation) && (!type || property.property_type === type) && (!zone || property.location === zone) && (!minPrice || (Number.isFinite(numericPrice) && numericPrice >= Number(minPrice))) && (!maxPrice || (Number.isFinite(numericPrice) && numericPrice <= Number(maxPrice)))
  }), [properties, operation, type, zone, minPrice, maxPrice])

  return (
    <main className="site-shell properties-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Carolina de Orta, inicio"><span>Carolina de Orta</span></a>
        <nav className="main-nav" aria-label="Navegación principal"><a href="/">Inicio</a><a href="/propiedades">Propiedades</a><a href="/#proyectos">Proyectos</a><a href="/#actualidad">Actualidad</a><a href="/#sobre-mí">Sobre mí</a><a href="/#contacto">Contacto</a></nav>
      </header>
      <section className="properties-page-intro section-pad"><div className="section-kicker">{kicker || '02 / PROPIEDADES'}</div><h1>{title || 'ESPACIOS PARA HABITAR'}</h1><p>Propiedades seleccionadas en Patagonia.</p></section>
      <section className="property-filters section-pad" aria-label="Filtrar propiedades"><label>Operación<select value={operation} onChange={(event) => setOperation(event.target.value)}><option value="">Todas</option>{operations.map((item) => <option key={item}>{item}</option>)}</select></label><label>Tipo<select value={type} onChange={(event) => setType(event.target.value)}><option value="">Todos</option>{types.map((item) => <option key={item}>{item}</option>)}</select></label><label>Zona<select value={zone} onChange={(event) => setZone(event.target.value)}><option value="">Todas</option>{zones.map((item) => <option key={item}>{item}</option>)}</select></label><label>Precio mínimo<input inputMode="decimal" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} /></label><label>Precio máximo<input inputMode="decimal" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></label></section>
      <section className="properties-long-list section-pad gray-section" aria-label="Propiedades publicadas">
        {filteredProperties.map((property, index) => {
          const propertyImages = images.filter((image) => image.property_id === property.id).sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
          const image = propertyImages[0]?.image_url || property.cover_image
          if (!image) return null
          const type = [property.property_type, property.operation_type].filter(Boolean).join(' · ') || property.status || 'Propiedad'
          return <Link className="property-card property-long-card" href={`/propiedades/${property.id}`} key={property.id}><div className="property-image"><Image src={image} alt={property.title} fill sizes="(max-width: 700px) 100vw, 80vw" /><span className="image-number">{String(index + 1).padStart(2, '0')}</span></div><div className="property-meta"><p className="eyebrow">{type}</p><h2>{property.title}</h2><p>{property.location}</p><div className="property-bottom"><span>{displayPrice(property.price)}</span><span>{displayArea(property.area)}</span></div></div></Link>
        })}
        {!filteredProperties.length && <p className="properties-empty">No hay propiedades que coincidan con los filtros.</p>}
      </section>
      <WhatsAppFloat url={whatsappUrl} />
      <footer className="site-footer"><span>© {new Date().getFullYear()} CAROLINA DE ORTA</span><a href="/">Volver al inicio ↑</a></footer>
    </main>
  )
}
