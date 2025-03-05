// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Client as HubspotClient } from "@hubspot/api-client";

// Initialize Stripe and HubSpot clients
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});
const hubspotClient = new HubspotClient({
  apiKey: process.env.HUBSPOT_ACCESS_TOKEN,
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
        const customerId = (event.data.object as { customer: string }).customer;
        console.log(event.data.object)
        await updateHubSpotContact(customerId);
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
async function updateHubSpotContact(stripeCustomerId: string) {
  try {
    // Fetch Stripe customer details
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    if (customer.deleted) throw new Error("Stripe customer deleted");

    // Update HubSpot contact by email
    if (!customer.email) {
      throw new Error("Customer email is required");
    }

    await hubspotClient.crm.contacts.basicApi.update(customer.email, {
      properties: {
        prepaid_status: "paid",
      },
    });
    console.log("HubSpot contact updated:", customer.email);
  } catch (err: unknown) {
    console.error(
      "HubSpot update failed:",
      err instanceof Error ? err.message : String(err),
    );
  }
}
