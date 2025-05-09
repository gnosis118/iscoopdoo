export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  customer_id: string
  service_type: "one-time" | "regular"
  frequency: "weekly" | "twice-weekly" | null
  dogs: number
  price: number
  status: "active" | "paused" | "cancelled"
  special_instructions: string | null
  created_at: string
  updated_at: string
}

export type ServiceDay = {
  id: string
  booking_id: string
  day_of_week: number // 1=Monday, 5=Friday
  created_at: string
}

export type BookingWithServiceDays = Booking & {
  service_days: ServiceDay[]
}

export type CustomerWithBookings = Customer & {
  bookings: BookingWithServiceDays[]
}
