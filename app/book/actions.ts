"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendBookingConfirmation, sendAdminNotification } from "@/lib/email"

type BookingFormData = {
  service: "one-time" | "regular"
  dogs: number
  frequency: "weekly" | "twice-weekly"
  selectedDays: Date[]
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  specialInstructions?: string
  paymentId?: string
  paymentStatus?: string
}

export async function createBooking(formData: BookingFormData) {
  try {
    const supabase = createServerSupabaseClient()

    // Get current user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Calculate price based on service type, dogs, and frequency
    let price = 0
    if (formData.service === "one-time") {
      price = 150
    } else {
      if (formData.frequency === "weekly") {
        if (formData.dogs === 1) price = 80
        else if (formData.dogs === 2) price = 100
        else if (formData.dogs === 3) price = 120
      } else {
        if (formData.dogs === 1) price = 100
        else if (formData.dogs === 2) price = 120
        else if (formData.dogs === 3) price = 140
      }
    }

    let customerId: string

    if (session) {
      // User is logged in, use their ID
      customerId = session.user.id

      // Update customer info
      const { error: customerError } = await supabase.from("customers").upsert({
        id: customerId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        updated_at: new Date().toISOString(),
      })

      if (customerError) {
        console.error("Error updating customer:", customerError)
        return { success: false, error: "Failed to update customer record" }
      }
    } else {
      // User is not logged in, create a guest customer
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .upsert(
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "email",
          },
        )
        .select("id")
        .single()

      if (customerError) {
        console.error("Error creating customer:", customerError)
        return { success: false, error: "Failed to create customer record" }
      }

      customerId = customerData.id
    }

    // Create booking
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_id: customerId,
        service_type: formData.service,
        frequency: formData.service === "regular" ? formData.frequency : null,
        dogs: formData.dogs,
        price,
        special_instructions: formData.specialInstructions || null,
        payment_id: formData.paymentId || null,
        payment_status: formData.paymentStatus || "pending",
      })
      .select("id")
      .single()

    if (bookingError) {
      console.error("Error creating booking:", bookingError)
      return { success: false, error: "Failed to create booking record" }
    }

    // If regular service, create service days
    let serviceDays: string[] = []
    if (formData.service === "regular" && formData.selectedDays.length > 0) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      serviceDays = formData.selectedDays.map((day) => dayNames[day.getDay()])

      const serviceDaysData = formData.selectedDays.map((day) => ({
        booking_id: bookingData.id,
        day_of_week: day.getDay() === 0 ? 7 : day.getDay(), // Convert Sunday=0 to Sunday=7
      }))

      const { error: serviceDaysError } = await supabase.from("service_days").insert(serviceDaysData)

      if (serviceDaysError) {
        console.error("Error creating service days:", serviceDaysError)
        return { success: false, error: "Failed to create service schedule" }
      }
    }

    // Send confirmation email
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`

    await sendBookingConfirmation(formData.email, formData.name, {
      id: bookingData.id,
      service: formData.service,
      frequency: formData.frequency,
      dogs: formData.dogs,
      price,
      serviceDays,
      address: fullAddress,
    })

    // Send admin notification
    await sendAdminNotification({
      id: bookingData.id,
      customerName: formData.name,
      customerEmail: formData.email,
      service: formData.service,
      frequency: formData.frequency,
      dogs: formData.dogs,
      price,
      serviceDays,
      address: fullAddress,
    })

    revalidatePath("/book")
    return {
      success: true,
      bookingId: bookingData.id,
      customerId,
    }
  } catch (error) {
    console.error("Error in createBooking:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
