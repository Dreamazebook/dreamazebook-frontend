import { type NextRequest } from 'next/server'

const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  // Basic validation
  if (!email || !validateEmail(email)) {
    return Response.json({msg: "Invalid Email"},{status:400});
  }

  if (!ACCESS_TOKEN) {
    return Response.json({msg:"Error subscribing email", code:'MISSING_TOKEN'}, {status: 500});
  }

  try {
    const response = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`, // Replace with your actual API key
        },
        body: JSON.stringify({
          properties: {
            email,
            hs_lead_status: 'NEW', // Add lead status to help with list filtering
            lifecyclestage: 'subscriber' // Add lifecycle stage
          },
          associations: [
            {
              to: {
                id: "17", // Replace with your actual HubSpot list ID
                type: "LISTS",
              }
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const responseData = await response.json();
      let msg;
      if (responseData.category == 'CONFLICT') {
        return Response.json({msg: "Subscription Successful", contactId:responseData.correlationId},{status:200});
      } else {
        msg = `Error subscribing email ${response.statusText}`;
      }
      return Response.json({msg},{status:response.status});
    }

    const data = await response.json();
    console.log("Subscription successful:", data);
    return Response.json({msg: "Subscription Successful"},{status:200});
  } catch (error) {
    console.error("Error subscribing email:", error);
    return Response.json({msg: "Error subscribing email"},{status:500});
  }
}

// Utility function to validate email format
function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
