import { Resend } from "resend"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates
export async function sendBookingConfirmation(
  to: string,
  name: string,
  bookingDetails: {
    id: string
    service: string
    frequency?: string
    dogs: number
    price: number
    serviceDays?: string[]
    address: string
  },
) {
  try {
    const { service, frequency, dogs, price, serviceDays, address } = bookingDetails

    const serviceType =
      service === "one-time"
        ? "One-Time Yard Clean-Up"
        : `${frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service`

    const serviceDaysText =
      serviceDays && serviceDays.length > 0 ? `<p>Service Days: ${serviceDays.join(", ")}</p>` : ""

    const priceText = service === "one-time" ? `$${price}` : `$${price}/month`

    const { data, error } = await resend.emails.send({
      from: "iScoopDoo <notifications@iscoopdoo.com>",
      to: [to],
      subject: "Your iScoopDoo Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Booking Confirmation</h1>
          <p>Hello ${name},</p>
          <p>Thank you for choosing iScoopDoo! Your booking has been confirmed.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Booking Details</h2>
            <p>Service: ${serviceType} (${dogs} ${dogs > 1 ? "Dogs" : "Dog"})</p>
            ${serviceDaysText}
            <p>Address: ${address}</p>
            <p>Price: ${priceText}</p>
          </div>
          
          <p>If you have any questions or need to make changes to your booking, please contact us at support@iscoopdoo.com or call (555) 123-4567.</p>
          
          <p>Thank you for your business!</p>
          <p>The iScoopDoo Team</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function sendAdminNotification(bookingDetails: {
  id: string
  customerName: string
  customerEmail: string
  service: string
  frequency?: string
  dogs: number
  price: number
  serviceDays?: string[]
  address: string
}) {
  try {
    const { customerName, customerEmail, service, frequency, dogs, price, serviceDays, address } = bookingDetails

    const serviceType =
      service === "one-time"
        ? "One-Time Yard Clean-Up"
        : `${frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service`

    const serviceDaysText =
      serviceDays && serviceDays.length > 0 ? `<p>Service Days: ${serviceDays.join(", ")}</p>` : ""

    const { data, error } = await resend.emails.send({
      from: "iScoopDoo <notifications@iscoopdoo.com>",
      to: ["admin@iscoopdoo.com"],
      subject: "New Booking Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">New Booking Alert</h1>
          <p>A new booking has been received:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Customer Information</h2>
            <p>Name: ${customerName}</p>
            <p>Email: ${customerEmail}</p>
            <p>Address: ${address}</p>
            
            <h2>Booking Details</h2>
            <p>Service: ${serviceType} (${dogs} ${dogs > 1 ? "Dogs" : "Dog"})</p>
            ${serviceDaysText}
            <p>Price: $${price}${service !== "one-time" ? "/month" : ""}</p>
          </div>
          
          <p>Please log in to the admin dashboard to view full details.</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending admin notification:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending admin notification:", error)
    return { success: false, error }
  }
}
