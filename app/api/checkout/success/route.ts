// app/api/checkout/success/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { SONGS } from '@/data/songs'

function safeDecode(v: string | null): string | null {
  if (!v) return null
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const sessionId = url.searchParams.get('session_id')

  // Prefer song from query; fallback to metadata later; finally default "polygamy"
  let songSlug = (url.searchParams.get('song') || '').trim().toLowerCase()

  if (!sessionId) {
    const fallback = SONGS[songSlug] ? songSlug : 'polygamy'
    return NextResponse.redirect(new URL(`/buy/${fallback}`, url), { status: 302 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product', 'customer'],
    })

    // If songSlug wasn't in the query, try pulling it from session metadata
    if (!songSlug) {
      const metaSlug = (session.metadata?.song_slug || '').trim().toLowerCase()
      songSlug = metaSlug || 'polygamy'
    }
    if (!SONGS[songSlug]) {
      // unknown/unsupported slug → fall back safely
      songSlug = 'polygamy'
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(new URL(`/buy/${songSlug}`, url), { status: 302 })
    }

    // Extract details
    const email =
      (session.customer_details?.email ||
        (typeof session.customer === 'object' ? session.customer.email : undefined) ||
        '')?.toLowerCase()
    const amount = (session.amount_total ?? 0) / 100
    const currency = session.currency?.toUpperCase() ?? 'USD'
    const priceId = (session as any).line_items?.data?.[0]?.price?.id ?? null

    // Record contribution (best effort) — now with song_slug
    if (email) {
      await supabaseAdmin.from('contributions').insert([
        { email, amount, currency, stripe_session_id: session.id, price_id: priceId, song_slug: songSlug },
      ])
      await supabaseAdmin.from('emails').upsert([{ email, source: 'checkout' }], { onConflict: 'email' })
    }

    // 🔹 Also log purchase in activity feed (best effort) — include song_slug
    try {
      const hdr = new Headers(req.headers)
      const rawCity    = hdr.get('x-vercel-ip-city')
      const rawRegion  = hdr.get('x-vercel-ip-country-region') || hdr.get('x-vercel-ip-region')
      const rawCountry = hdr.get('x-vercel-ip-country')

      const city    = safeDecode(rawCity)
      const region  = safeDecode(rawRegion)
      const country = safeDecode(rawCountry)

      await supabaseAdmin.from('activity').insert([
        {
          type: 'purchase',
          amount_cents: session.amount_total ?? null,
          city,
          region,
          country,
          song_slug: songSlug,
        },
      ])
    } catch (err) {
      console.warn('[activity] purchase insert failed (non-fatal):', err)
    }

    // Set unlock cookies (legacy global + per-song) + send to /download/<slug>
    const res = NextResponse.redirect(new URL(`/download/${songSlug}`, url), { status: 302 })

    // Legacy global flag (kept for backward compatibility)
    res.cookies.set('supporter', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    })

    // ✅ Per-song flag (used by /releases/[slug], /download/[slug], etc.)
    res.cookies.set(`supporter_${songSlug}`, '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    })

    return res
  } catch (e) {
    console.error(e)
    // Any error → back to per-song buy (no unlock)
    const fallback = SONGS[(url.searchParams.get('song') || '').trim().toLowerCase()] ? (url.searchParams.get('song') || '').trim().toLowerCase() : 'polygamy'
    return NextResponse.redirect(new URL(`/buy/${fallback}`, req.url), { status: 302 })
  }
}
