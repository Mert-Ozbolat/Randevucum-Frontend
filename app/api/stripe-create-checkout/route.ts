import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }
  try {
    const { businessId, priceId, successUrl, cancelUrl } = await request.json();
    if (!businessId || !priceId) {
      return NextResponse.json(
        { error: 'businessId and priceId required' },
        { status: 400 }
      );
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${request.nextUrl.origin}/dashboard/business/subscription?success=1`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}/dashboard/business/subscription`,
      client_reference_id: businessId,
      metadata: { businessId },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Stripe error' },
      { status: 500 }
    );
  }
}
