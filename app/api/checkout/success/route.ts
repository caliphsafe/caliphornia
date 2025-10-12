// app/api/checkout/success/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

  if (!sessionId) {
    // No session → back to buy
    return NextResponse.redirect(new URL('/buy', url), { status: 302 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product', 'customer'],
    })

    if (session.payment_status !== 'paid') {
      // Not paid → back to buy
      return NextResponse.redirect(new URL('/buy', url), { status: 302 })
    }

    // Extract details
    const email =
      (session.customer_details?.email ||
        (typeof session.customer === 'object' ? session.customer.email : undefined) ||
        '')?.toLowerCase()
    const amount = (session.amount_total ?? 0) / 100
    const currency = session.currency?.toUpperCase() ?? 'USD'
    const priceId = (session as any).line_items?.data?.[0]?.price?.id ?? null

    // Record contribution (best effort)
    if (email) {
      await supabaseAdmin.from('contributions').insert([
        { email, amount, currency, stripe_session_id: session.id, price_id: priceId },
      ])
      await supabaseAdmin.from('emails').upsert([{ email, source: 'checkout' }], { onConflict: 'email' })
    }

    // 🔹 Also log purchase in activity feed with decoded location (best effort)
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
        },
      ])
    } catch (err) {
      console.warn('[activity] purchase insert failed (non-fatal):', err)
    }

    // Set unlock cookies (legacy global + per-song) + send to /download
    const res = NextResponse.redirect(new URL('/download', url), { status: 302 })

    // Legacy global flag (kept for backward compatibility)
    res.cookies.set('supporter', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    })

    // ✅ Per-song flag for Polygamy (used by /releases/[slug] flow)
    res.cookies.set('supporter_polygamy', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    })

    return res
  } catch (e) {
    console.error(e)
    // Any error → back to buy (no unlock)
    return NextResponse.redirect(new URL('/buy', req.url), { status: 302 })
  }
}
