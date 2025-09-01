// app/api/checkout/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

function dollarsToCents(d: number) {
  return Math.round(d * 100);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const priceId = url.searchParams.get('price_id') || undefined;
  const amountStr = url.searchParams.get('amount') || undefined; // dollars (string)
  const email = url.searchParams.get('email') || undefined;      // optional prefill
  const productName = url.searchParams.get('label') || 'Support Contribution';
  const successReturn = url.searchParams.get('return_to') || '/api/checkout/success';

  try {
    let sessionUrl: string | null = null;

    // Case A: preset price (recommended for fixed buttons)
    if (priceId) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${url.origin}${successReturn}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url.origin}/buy`,
        customer_email: email,
        metadata: { source: 'buy-page', kind: 'preset' },
      });
      sessionUrl = session.url!;
    } else {
      // Case B: custom amount (no price object needed)
      const amountDollars = amountStr ? Number(amountStr) : NaN;
      const valid = Number.isFinite(amountDollars) && amountDollars >= 1 && amountDollars <= 100000;
      if (!valid) return new NextResponse('Invalid amount', { status: 400 });

      const unitAmount = dollarsToCents(amountDollars);

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: unitAmount,
              product_data: {
                name: productName,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${url.origin}${successReturn}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url.origin}/buy`,
        customer_email: email,
        metadata: { source: 'buy-page', kind: 'custom', amount_dollars: String(amountDollars) },
      });
      sessionUrl = session.url!;
    }

    return NextResponse.redirect(sessionUrl, { status: 303 });
  } catch (e) {
    console.error(e);
    return new NextResponse('Failed to create checkout session', { status: 500 });
  }
}
