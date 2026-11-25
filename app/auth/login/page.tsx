'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: signInError } = await createClient().auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      router.replace('/admin')
      router.refresh()
    } catch {
      setError('No pudimos iniciar sesión. Revisá tu email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="admin-auth"><div className="admin-auth-card"><a className="admin-brand" href="/">CAROLINA<br />DE ORTA</a><p className="admin-eyebrow">ADMINISTRACIÓN</p><h1>Entrar al panel</h1><p className="admin-muted">Gestioná el contenido de tu sitio.</p><form onSubmit={handleSubmit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error && <p className="admin-error" role="alert">{error}</p>}<button className="admin-button" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button></form><a className="admin-back" href="/">Volver al sitio</a></div></main>
}
