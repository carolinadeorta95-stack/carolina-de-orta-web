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

    const leadData = { name, email, phone, message, propertyId, propertyTitle, source: 'carolina-de-orta-web', receivedAt: new Date().toISOString() }
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
      redirect: 'follow',
      cache: 'no-store',
    })

    const webhookAccepted = webhookResponse.ok || webhookResponse.status === 200 || webhookResponse.status === 302
    if (!webhookAccepted) {
      return NextResponse.json({ error: 'No se pudo reenviar la consulta al webhook.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'No se pudo procesar la consulta.' }, { status: 500 })
  }
}
