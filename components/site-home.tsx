'use client'

import Image from 'next/image'
import { ArrowDown, ArrowRight, Menu, Play, Plus, X } from 'lucide-react'
import { useState } from 'react'

const properties = [
  { image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', type: 'Casa · Venta', title: 'Casa en Barrio Los Faldeos', location: 'San Martín de los Andes', price: 'USD 420.000', area: '186 m²' },
  { image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85', type: 'Departamento · Venta', title: 'Refugio contemporáneo', location: 'Centro · San Martín de los Andes', price: 'USD 198.000', area: '72 m²' },
  { image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85', type: 'Casa · Venta', title: 'Patio de luz', location: 'Lago Lolog', price: 'USD 560.000', area: '224 m²' },
]

const journal = [
  { category: 'Mercado', title: 'Leer el territorio antes de invertir', date: '12.06.24', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85' },
  { category: 'Análisis', title: 'Patagonia: señales de un mercado que cambia', date: '28.05.24', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=85' },
]

export function SiteHome() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Carolina de Orta, inicio"><span>CAROLINA</span><span>DE ORTA</span></a>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navegación principal">
          {['Propiedades', 'Proyectos', 'Actualidad', 'Sobre mí', 'Contacto'].map((item) => <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMenuOpen(false)}>{item}</a>)}
        </nav>
        <button className="menu-toggle" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>

      <section id="inicio" className="hero-section">
        <div className="hero-image"><Image src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2200&q=90" alt="Paisaje patagónico de montaña y lago" fill priority sizes="100vw" /></div>
        <div className="hero-overlay" />
        <div className="hero-copy"><p className="eyebrow light">REAL ESTATE · ECONOMÍA · PATAGONIA</p><h1>Donde el territorio<br /><em>se vuelve decisión.</em></h1><p className="hero-description">Una mirada profesional sobre propiedades, proyectos e inversiones en Patagonia Argentina.</p><a className="text-link light-link" href="#propiedades">Explorar propiedades <ArrowRight size={16} /></a></div>
        <div className="hero-index">01 <span>/</span> 05</div><a href="#intro" className="scroll-cue" aria-label="Continuar"><ArrowDown size={17} /></a>
      </section>

      <section id="intro" className="intro-section section-pad"><div className="section-kicker">01 / UNA MIRADA PROPIA</div><div className="intro-grid"><h2>Patagonia, <em>con criterio.</em></h2><div><p className="lead">Soy Carolina de Orta, Licenciada en Economía y Martillera Pública. Acompaño decisiones inmobiliarias con análisis, conocimiento del territorio y una perspectiva de largo plazo.</p><a href="#sobre-mí" className="text-link">Conocer más sobre mí <ArrowRight size={16} /></a></div></div></section>

      <section id="propiedades" className="properties-section section-pad gray-section"><div className="section-heading"><div><div className="section-kicker">02 / PROPIEDADES</div><h2>Espacios para<br /><em>habitar.</em></h2></div><a className="text-link" href="#contacto">Ver todas <ArrowRight size={16} /></a></div><div className="property-grid">{properties.map((property, index) => <article className={index === 0 ? 'property-card featured' : 'property-card'} key={property.title}><div className="property-image"><Image src={property.image} alt={property.title} fill sizes="(max-width: 700px) 100vw, 33vw" /><span className="image-number">0{index + 1}</span></div><div className="property-meta"><p className="eyebrow">{property.type}</p><h3>{property.title}</h3><p>{property.location}</p><div className="property-bottom"><span>{property.price}</span><span>{property.area}</span></div></div></article>)}</div></section>

      <section id="proyectos" className="projects-section section-pad"><div className="projects-copy"><div className="section-kicker light">03 / PROYECTOS</div><h2>Ideas que<br /><em>toman forma.</em></h2><p>Desarrollos seleccionados y oportunidades para invertir en un territorio con identidad, crecimiento y horizonte.</p><a className="text-link light-link" href="#contacto">Conocer proyectos <ArrowRight size={16} /></a></div><div className="project-visual"><Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85" alt="Arquitectura contemporánea integrada al paisaje" fill sizes="(max-width: 800px) 100vw, 50vw" /><div className="project-tag">01 <span>·</span> DESARROLLO</div></div></section>

      <section id="actualidad" className="journal-section section-pad"><div className="section-heading"><div><div className="section-kicker">04 / ACTUALIDAD</div><h2>Notas sobre<br /><em>el territorio.</em></h2></div><a className="text-link" href="#contacto">Ver actualidad <ArrowRight size={16} /></a></div><div className="journal-grid">{journal.map((item) => <article className="journal-card" key={item.title}><div className="journal-image"><Image src={item.image} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" /><span className="play-mark"><Play size={14} fill="currentColor" /></span></div><div className="journal-info"><div><p className="eyebrow">{item.category}</p><h3>{item.title}</h3></div><span>{item.date}</span></div></article>)}</div></section>

      <section id="sobre-mí" className="about-section section-pad gray-section"><div className="about-image"><Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85" alt="Retrato editorial de Carolina de Orta" fill sizes="(max-width: 800px) 100vw, 35vw" /></div><div className="about-copy"><div className="section-kicker">05 / SOBRE MÍ</div><h2>Una forma<br />de <em>mirar.</em></h2><p className="lead">La economía y el real estate se encuentran en una misma pregunta: ¿qué hace que un lugar tenga valor?</p><p>Mi trabajo parte de escuchar, observar y traducir información compleja en decisiones claras. Con San Martín de los Andes y la Patagonia como territorio de estudio y pertenencia.</p><a href="#contacto" className="text-link">Hablemos <ArrowRight size={16} /></a></div></section>

      <section id="contacto" className="contact-section section-pad"><div className="section-kicker light">06 / CONTACTO</div><div className="contact-grid"><h2>Hagamos lugar<br />a una <em>conversación.</em></h2><div><p>Si estás pensando en comprar, vender o invertir en Patagonia, escribime.</p><a href="mailto:hola@carolinadeorta.com" className="contact-email">hola@carolinadeorta.com <ArrowRight size={18} /></a><div className="socials"><a href="#contacto" aria-label="Instagram">IG</a><a href="#contacto" aria-label="LinkedIn">in</a><a href="#contacto" aria-label="WhatsApp"><Plus size={18} /></a></div></div></div></section>

      <footer className="site-footer"><span>© {new Date().getFullYear()} CAROLINA DE ORTA</span><span>LIC. EN ECONOMÍA · MARTILLERA PÚBLICA</span><a href="#inicio">Volver arriba ↑</a></footer>
    </main>
  )
}
