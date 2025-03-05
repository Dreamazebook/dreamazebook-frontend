// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateContactByEmail } from "@/utils/hubspot";

// Initialize Stripe and HubSpot clients
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    // Get the Stripe signature from the headers
    const signature = request.headers.get("stripe-signature") as string;

    // Verify the webhook event
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );

    // Handle Stripe events
    switch (event.type) {
      case "customer.subscription.updated":
      case "payment_intent.succeeded": {
        const eventObject = event.data.object;
        console.log(eventObject)
        if (eventObject.object === 'payment_intent') {
          const paymentIntent = eventObject as Stripe.PaymentIntent;
          const email = paymentIntent.receipt_email || '';
          await updateHubSpotContact(email);
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    console.error(
      `Webhook Error: ${err instanceof Error ? err.message : String(err)}`,
    );
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 400 },
    );
  }
}

// Update HubSpot contact using Stripe customer data
async function updateHubSpotContact(email: string) {
  if (!email) {
    console.error("No email provided");
    return;
  }
  try {
    await updateContactByEmail(email, {prepaid_status: 'paid'});
    console.log("HubSpot contact updated:", email);
  } catch (err: unknown) {
    console.error(
      "HubSpot update failed:",
      err instanceof Error ? err.message : String(err),
    );
  }
}
