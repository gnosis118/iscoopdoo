"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
}

export async function createBookingWithPrisma(formData: BookingFormData) {
  try {
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

    // Create or update customer and booking in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or update customer
      const customer = await tx.customer.upsert({
        where: { email: formData.email },
        update: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          updatedAt: new Date(),
        },
        create: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
      })

      // Create booking
      const booking = await tx.booking.create({
        data: {
          customerId: customer.id,
          serviceType: formData.service,
          frequency: formData.service === "regular" ? formData.frequency : null,
          dogs: formData.dogs,
          price: price,
          specialInstructions: formData.specialInstructions || null,
          serviceDays:
            formData.service === "regular" && formData.selectedDays.length > 0
              ? {
                  create: formData.selectedDays.map((day) => ({
                    dayOfWeek: day.getDay() === 0 ? 7 : day.getDay(), // Convert Sunday=0 to Sunday=7
                  })),
                }
              : undefined,
        },
      })

      return { customer, booking }
    })

    revalidatePath("/book")
    return {
      success: true,
      bookingId: result.booking.id,
      customerId: result.customer.id,
    }
  } catch (error) {
    console.error("Error in createBookingWithPrisma:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
