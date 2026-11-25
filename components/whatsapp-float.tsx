'use client'

import { MessageCircle } from 'lucide-react'

function isSafeWhatsAppUrl(value?: string) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (url.hostname === 'wa.me' || url.hostname.endsWith('.whatsapp.com'))
  } catch {
    return false
  }
}

export function WhatsAppFloat({ url }: { url?: string }) {
  if (!isSafeWhatsAppUrl(url)) return null
  return <a className="whatsapp-float" href={url} target="_blank" rel="noreferrer" aria-label="Abrir conversación por WhatsApp"><MessageCircle size={23} strokeWidth={2.2} /><span>WhatsApp</span></a>
}
