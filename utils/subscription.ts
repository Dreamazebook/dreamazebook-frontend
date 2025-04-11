const ACCESS_TOKEN = process.env.MAILERLITE_API_KEY;

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
export const sendRequest = async ({url, method, body}:sendRequestProps) => {
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
  return await response.json();
}

const LANDING_PAGE_GROUP_ID = '151413301218117367';

export const checkHubSpotContact = async (email:string) => {
    const response = await sendRequest({
    url: `https://connect.mailerlite.com/api/subscribers/${email}`,
    method: "GET",
  });
  return response
}

export const subscribeEmail = async (email:string, properties?:object) => {
  const body = {email,fields: {},groups:[LANDING_PAGE_GROUP_ID]};
  if (properties) {
    body.fields = properties;
  }
  const response = await sendRequest(
    {
      url:"https://connect.mailerlite.com/api/subscribers",
      method: "POST",
      body
    }
  );
  return response;
}

export const updateContact = async (contactId:string, properties:object) => {
  const response = await sendRequest(
    {
      url: `https://connect.mailerlite.com/api/subscribers/${contactId}`,
      method: 'PUT',
      body: {
        fields: properties
      }
    }
  );
  return response;
}

export const updateContactByEmail = async (email:string, properties:object) => {
  const response = await checkHubSpotContact(email);
  const emailId = response.data.id;
  if (emailId) {
    const updateResponse = await updateContact(emailId, properties);
    return updateResponse;
  } else {
    const response = await subscribeEmail(email, properties);
    return response;
  }
}