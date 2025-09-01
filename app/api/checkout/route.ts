// app/api/checkout/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const priceId = url.searchParams.get('price_id') || process.env.STRIPE_DEFAULT_PRICE_ID
  const email = url.searchParams.get('email') || undefined // optional; nice to prefill

  if (!priceId) {
    return new NextResponse('Missing price_id', { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${url.origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/home`,
      customer_email: email,
      metadata: {
        // You can add any useful metadata; we’ll read it on success if needed
        source: 'site',
      },
    })

    // Redirect user to Stripe hosted checkout
    return NextResponse.redirect(session.url!, { status: 303 })
  } catch (e) {
    console.error(e)
    return new NextResponse('Failed to create checkout session', { status: 500 })
  }
}
