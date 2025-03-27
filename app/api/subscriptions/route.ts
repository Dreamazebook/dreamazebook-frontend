import { type NextRequest } from 'next/server'
import { checkHubSpotContact, subscribeEmail, updateContact, getContactDetail } from '../../../utils/subscription';

export async function GET(request: NextRequest) {
  const contactId = request.nextUrl.searchParams.get('contactId') || '';
  const response = await getContactDetail(contactId);
  return Response.json({response},{status:200});
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  // Basic validation
  if (!email || !validateEmail(email)) {
    return Response.json({msg: "Invalid Email"},{status:400});
  }

  try {
    let response = await checkHubSpotContact(email);

    if (response.data) {
      return Response.json({'msg':"Email already subscribed"},{status:200});
    }


    response = await subscribeEmail(email);

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
  const {contactId, ...properties} = await request.json();
  try {
    await updateContact(contactId, properties);
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
