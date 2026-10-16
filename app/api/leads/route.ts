import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const email = typeof payload.email === 'string' ? payload.email.trim() : ''
    const phone = typeof payload.phone === 'string' ? payload.phone.trim() : ''
    const message = typeof payload.message === 'string' ? payload.message.trim() : ''
    const propertyId = typeof payload.propertyId === 'string' ? payload.propertyId.trim() : ''
    const propertyTitle = typeof payload.propertyTitle === 'string' ? payload.propertyTitle.trim() : ''

    if (name.length < 2 || name.length > 120 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 200 || phone.length > 40 || message.length < 5 || message.length > 2000 || !propertyId || propertyTitle.length < 1 || propertyTitle.length > 200) {
      return NextResponse.json({ error: 'Revisá los datos ingresados.' }, { status: 400 })
    }

    const webhookUrl = process.env.LEADS_WEBHOOK_URL
    if (!webhookUrl) return NextResponse.json({ error: 'El canal de recepción de consultas no está configurado.' }, { status: 503 })

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message, propertyId, propertyTitle, source: 'carolina-de-orta-web', receivedAt: new Date().toISOString() }),
      cache: 'no-store',
    })

    if (!response.ok) return NextResponse.json({ error: 'No se pudo entregar la consulta.' }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Revisá los datos ingresados.' }, { status: 400 })
  }
}
