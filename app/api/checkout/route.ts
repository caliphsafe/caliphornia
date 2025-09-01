// app/api/checkout/success/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const sessionId = url.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.redirect(new URL('/home', url), { status: 302 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product', 'customer'],
    })

    if (session.payment_status !== 'paid') {
      // Not paid, send back normally
      return NextResponse.redirect(new URL('/home', url), { status: 302 })
    }

    // Pull useful fields
    const email =
      (session.customer_details?.email ||
        (typeof session.customer === 'object' ? session.customer.email : undefined) ||
        '')?.toLowerCase()

    const amount = (session.amount_total ?? 0) / 100
    const currency = session.currency?.toUpperCase() ?? 'USD'
    const priceId = session.line_items?.data?.[0]?.price?.id ?? null

    // Record contribution (best-effort; ignore failures)
    if (email) {
      await supabaseAdmin.from('contributions').insert([
        {
          email,
          amount,
          currency,
          stripe_session_id: session.id,
          price_id: priceId,
        },
      ])
      // Also ensure email is in the emails table (idempotent)
      await supabaseAdmin.from('emails').upsert([{ email, source: 'checkout' }], {
        onConflict: 'email',
      })
    }

    // ✅ Set supporter cookie and send back to /home
    const res = NextResponse.redirect(new URL('/home', url), { status: 302 })
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
    return NextResponse.redirect(new URL('/home', req.url), { status: 302 })
  }
}
