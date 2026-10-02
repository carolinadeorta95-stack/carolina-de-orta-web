'use client'

import Image from 'next/image'

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
  return text || '—'
}

function displayArea(value: string | number | null | undefined) {
  if (value === null || value === undefined || String(value).trim() === '') return '—'
  const text = String(value).trim()
  return /m²|m2/i.test(text) ? text : `${text} m²`
}

export function PropertiesPage({ properties, images }: { properties: Property[]; images: PropertyImage[] }) {
  return (
    <main className="site-shell properties-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Carolina de Orta, inicio"><span>Carolina de Orta</span></a>
        <nav className="main-nav" aria-label="Navegación principal"><a href="/">Inicio</a><a href="/propiedades">Propiedades</a><a href="/#proyectos">Proyectos</a><a href="/#actualidad">Actualidad</a><a href="/#sobre-mí">Sobre mí</a><a href="/#contacto">Contacto</a></nav>
      </header>
      <section className="properties-page-intro section-pad"><div className="section-kicker">02 / PROPIEDADES</div><h1>Espacios para <em>habitar.</em></h1><p>Propiedades seleccionadas en Patagonia.</p></section>
      <section className="properties-long-list section-pad gray-section" aria-label="Propiedades publicadas">
        {properties.map((property, index) => {
          const propertyImages = images.filter((image) => image.property_id === property.id).sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
          const image = propertyImages[0]?.image_url || property.cover_image
          if (!image) return null
          const type = [property.property_type, property.operation_type].filter(Boolean).join(' · ') || property.status || 'Propiedad'
          return <article className="property-card property-long-card" key={property.id}><div className="property-image"><Image src={image} alt={property.title} fill sizes="(max-width: 700px) 100vw, 80vw" /><span className="image-number">{property.property_code || String(index + 1).padStart(2, '0')}</span></div><div className="property-meta"><p className="eyebrow">{type}</p><h2>{property.title}</h2><p>{property.location}</p><div className="property-bottom"><span>{displayPrice(property.price)}</span><span>{displayArea(property.area)}</span></div></div></article>
        })}
        {!properties.length && <p className="properties-empty">No hay propiedades publicadas.</p>}
      </section>
      <footer className="site-footer"><span>© {new Date().getFullYear()} CAROLINA DE ORTA</span><a href="/">Volver al inicio ↑</a></footer>
    </main>
  )
}
