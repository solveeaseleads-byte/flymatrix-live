import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, amount, metadata } = await request.json();

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack expects amount in the lowest currency unit (e.g., kobo/cents)
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/callback`,
        metadata,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ authorizationUrl: data.data.authorization_url, reference: data.data.reference });
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
