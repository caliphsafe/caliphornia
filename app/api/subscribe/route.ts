// app/api/subscribe/route.ts
export const runtime = 'nodejs'  // ensures server (not edge) so env + service role work

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Body = { email?: string; source?: string }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const raw = (body.email || '').trim()
    const email = raw.toLowerCase()
    const source = (body.source || 'site').slice(0, 64)

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existing, error: selErr } = await supabaseAdmin
      .from('emails')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (selErr) {
      console.error(selErr)
      return NextResponse.json({ ok: false, error: 'select_failed' }, { status: 500 })
    }

    if (existing) {
      // Already subscribed — idempotent success
      return NextResponse.json({ ok: true, status: 'exists' }, { status: 200 })
    }

    const { error: insErr } = await supabaseAdmin
      .from('emails')
      .insert([{ email, source }])

    if (insErr) {
      // Unique constraint race? Treat as exists if conflict on email.
      if ((insErr as any).code === '23505') {
        return NextResponse.json({ ok: true, status: 'exists' }, { status: 200 })
      }
      console.error(insErr)
      return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, status: 'new' }, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }
}
