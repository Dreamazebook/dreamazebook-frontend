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


export const checkHubSpotContact = async (email:string) => {
    const response = await sendRequest({
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
  return response
}

export const subscribeEmail = async (email:string) => {
  const response = await sendRequest(
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
  return response;
}

export const updateContact = async (contactId:string, properties:object) => {
  const response = await sendRequest(
    {
      url: `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
      method: 'PATCH',
      body: {
        properties,
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
  return response;
}

export const updateContactByEmail = async (email:string, properties:object) => {
  const response = await checkHubSpotContact(email);
  if (response.total == 0) {
    // Create contact
  } else {
    const contactId = response.results[0]?.id;
    const updateResponse = await updateContact(contactId, properties);
    return updateResponse;
  }
}