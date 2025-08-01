import { type NextRequest } from 'next/server'
import { checkHubSpotContact, subscribeEmail, updateContact } from '../../../utils/subscription';

export async function POST(request: NextRequest) {
  const { email, properties } = await request.json();

  // Basic validation
  if (!email || !validateEmail(email)) {
    return Response.json({msg: "Invalid Email"},{status:400});
  }

  try {
    let response = await checkHubSpotContact(email);

    if (response.data) {
      const contactId = response.data.id;
      await updateContact(contactId, properties);
      return Response.json({'msg':"Email already subscribed"},{status:200});
    }


    response = await subscribeEmail(email,properties);

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
  const {contactId, email, ...properties} = await request.json();
  try {
    if (contactId) {
      await updateContact(contactId, properties);
    } else {
      await subscribeEmail(email, properties);
    }
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
