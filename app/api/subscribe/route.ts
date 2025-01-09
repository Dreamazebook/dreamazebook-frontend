import { type NextRequest } from 'next/server'

const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  // Basic validation
  if (!email || !validateEmail(email)) {
    return Response.json({msg: "Invalid Email"},{status:400});
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
            email
          }
        }),
      }
    );

    if (!response.ok) {
      console.error(response);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Subscription successful:", data);
    return Response.json({msg: "Subscription successful"},{status:200});
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
