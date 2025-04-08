// app/api/mailerlite-webhook/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const MAILERLITE_GROUP_ID = '150850576633038531';

export async function POST(request: Request) {
  try {
    // 1. Verify Meta Webhook Signature
    const metaAppSecret = process.env.META_APP_SECRET!;
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature') || '';

    const expectedSignature = crypto
      .createHmac('sha1', metaAppSecret)
      .update(rawBody)
      .digest('hex');

    if (`sha1=${expectedSignature}` !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse Lead Data
    const body = JSON.parse(rawBody);
    const leadData = body.entry[0].changes[0].value;
    
    // Extract relevant fields (customize based on your form fields)
    const email = leadData.email;
    const name = leadData.name;

    // 3. Sync with MailerLite
    const mailerliteResponse = await fetch(
      `https://api.mailerlite.com/api/v2/groups/${MAILERLITE_GROUP_ID}/subscribers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bear ${process.env.MAILERLITE_API_KEY}`,
        },
        body: JSON.stringify({
          email: email,
          fields: {
            name: name,
            // add more fields as needed
          }
        })
      }
    );

    if (!mailerliteResponse.ok) {
      throw new Error('MailerLite API error');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}