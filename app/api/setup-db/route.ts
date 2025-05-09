import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Create customers table
    const { error: customersError } = await supabase.rpc("create_customers_table", {})
    if (customersError && !customersError.message.includes("already exists")) {
      return NextResponse.json({ error: customersError.message }, { status: 500 })
    }

    // Create bookings table
    const { error: bookingsError } = await supabase.rpc("create_bookings_table", {})
    if (bookingsError && !bookingsError.message.includes("already exists")) {
      return NextResponse.json({ error: bookingsError.message }, { status: 500 })
    }

    // Create service_days table
    const { error: serviceDaysError } = await supabase.rpc("create_service_days_table", {})
    if (serviceDaysError && !serviceDaysError.message.includes("already exists")) {
      return NextResponse.json({ error: serviceDaysError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Database setup complete" })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json({ error: "Failed to set up database" }, { status: 500 })
  }
}
