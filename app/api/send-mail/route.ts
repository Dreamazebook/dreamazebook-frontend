import { NextRequest, NextResponse } from 'next/server'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  issueType: string
  orderNumber: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, issueType, orderNumber, subject, message } = body as ContactFormData

    // Validate required fields
    if (!firstName || !lastName || !email || !issueType || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get Mailgun credentials from environment
    const mailgunDomain = process.env.MAILGUN_DOMAIN
    const mailgunSecret = process.env.MAILGUN_SECRET

    if (!mailgunDomain || !mailgunSecret) {
      console.error('Mailgun credentials not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Initialize Mailgun
    const mailgun = new Mailgun(FormData)
    const mg = mailgun.client({ username: 'api', key: mailgunSecret, url: "https://api.eu.mailgun.net" })

    // Compose email
    const messageData = {
      from: `noreply@${mailgunDomain}`,
      to: 'hello@dreamazebook.com',
      'h:Reply-To': email,
      subject: `New Contact Request: ${subject}`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2563eb;">New Contact Request from Dreamaze Book</h2>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Customer Information</h3>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Issue Type:</strong> ${issueType}</p>
              ${orderNumber ? `<p><strong>Order Number:</strong> ${orderNumber}</p>` : ''}
            </div>

            <div style="margin: 20px 0;">
              <h3>Subject</h3>
              <p>${subject}</p>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <h3 style="margin-top: 0;">Message</h3>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
              This email was sent from the Dreamaze Book contact form.
            </p>
          </body>
        </html>
      `,
      text: `
New Contact Request from Dreamaze Book

Customer Information:
Name: ${firstName} ${lastName}
Email: ${email}
Issue Type: ${issueType}
${orderNumber ? `Order Number: ${orderNumber}` : ''}

Subject: ${subject}

Message:
${message}

---
This email was sent from the Dreamaze Book contact form.
      `
    }

    // Send email via Mailgun
    const response = await mg.messages.create(mailgunDomain, messageData)

    return NextResponse.json(
      {
        success: true,
        message: 'Email sent successfully',
        messageId: response.id
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
