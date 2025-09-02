// app/api/checkout/success/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

    // 🔹 NEW: log purchase in activity feed (best effort; amount_total is in cents)
    try {
      await supabaseAdmin.from('activity').insert([
        { type: 'purchase', amount_cents: session.amount_total ?? null },
      ])
    } catch (err) {
      console.warn('[activity] purchase insert failed (non-fatal):', err)
    }

    // Set unlock cookie + send to /download
    const res = NextResponse.redirect(new URL('/download', url), { status: 302 })
    res.cookies.set('supporter', '1', {
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

