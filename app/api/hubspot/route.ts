import { type NextRequest } from 'next/server'

const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

interface sendRequestProps {
  url: string
  method: string
  body?: {
    [key:string]:string|object
  }
}

interface optionsProps {
  method: string,
  headers: {
    'Content-Type': string,
    Authorization: string,
  },
  body?: string
}
const sendRequest = async ({url, method, body}:sendRequestProps) => {
  const options:optionsProps = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  return response.json();
}

export async function POST(request: NextRequest) {
  const { email, selected_cover } = await request.json();

  // Basic validation
  if (!email || !validateEmail(email)) {
    return Response.json({msg: "Invalid Email"},{status:400});
  }

  if (!ACCESS_TOKEN) {
    return Response.json({msg:"Error subscribing email", code:'MISSING_TOKEN'}, {status: 500});
  }

  try {
    let response = await sendRequest({
      url: 'https://api.hubapi.com/crm/v3/objects/contacts/search',
      method: "POST",
      body: {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
      }
    });

    if (response.total > 0) {
      const contactId = response.results[0]?.id;
      return Response.json({'msg':"Email already subscribed", contactId},{status:200});
    }


    response = await sendRequest(
      {
        url:"https://api.hubapi.com/crm/v3/objects/contacts",
        method: "POST",
        body:{
          properties: {
            email,
            selected_cover: 'hardcover',
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
        }
      }
    );

    if (response.status == 'error') {
      console.error("Error subscribing email:", response);
      return Response.json({msg: "Error subscribing email"},{status:response.status});
    }

    return Response.json({msg: "Subscription Successful", contactId: response.id},{status:200});
  } catch (error) {
    console.error("Error subscribing email:", error);
    return Response.json({msg: "Error subscribing email"},{status:500});
  }
}

export async function PATCH(request:NextRequest) {
  const {selected_cover, contactId} = await request.json();
  try {
    const updateResponse = await sendRequest(
      {
        url: `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        method: 'PATCH',
        body: {
          properties: {
            selected_cover,
          },
          associations: [
            {
              to: {
                id: "17", // Replace with your actual HubSpot list ID
                type: "LISTS",
              }
            }
          ]
        }
      }
    );
    console.info(updateResponse);
    return Response.json({msg: "Contact updated successfully"},{status:200});
  } catch (error) {
    console.error("Error updating contact:", error);
    return Response.json({msg: "Error updating contact"},{status:500});
  }
}

// Utility function to validate email format
function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
