import { NextResponse } from 'next/server'

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>
    const name = readString(payload.nombre ?? payload.name)
    const email = readString(payload.email)
    const phone = readString(payload.telefono ?? payload.phone)
    const message = readString(payload.mensaje ?? payload.message)
    const propertyId = readString(payload.propertyId ?? payload.property_id)
    const propertyTitle = readString(payload.propertyTitle ?? payload.property_title)

    if (!email || !/^\S+@\S+\.\S+$/.test(email) || email.length > 200 || !message || message.length > 2000) {
      return NextResponse.json({ error: 'El email y el mensaje son obligatorios.' }, { status: 400 })
    }

    const webhookUrl = process.env.LEADS_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json({ error: 'El webhook de consultas no está configurado.' }, { status: 500 })
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message, propertyId, propertyTitle, source: 'carolina-de-orta-web', receivedAt: new Date().toISOString() }),
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'No se pudo reenviar la consulta al webhook.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'No se pudo procesar la consulta.' }, { status: 500 })
  }
}
