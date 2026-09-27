import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // 1. Verify the signature to ensure the request is genuinely from Paystack
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(bodyText)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    // 2. Handle the specific event type
    if (event.event === 'charge.success') {
      const transaction = event.data;
      const customerEmail = transaction.customer.email;
      const planName = transaction.metadata?.plan;
      const reference = transaction.reference;

      console.log(`Payment successful for ${customerEmail} - Plan: ${planName} (Ref: ${reference})`);

      // TODO: Add your database fulfillment logic here 
      // (e.g., update user subscription status in Supabase using transaction.reference)
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
