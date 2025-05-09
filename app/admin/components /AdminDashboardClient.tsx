"use client"

import { useEffect, useState } from "react"
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"

interface AdminDashboardClientProps {
  accessToken: string
}

interface Booking {
  id: string
  created_at: string
  status: string
  price: number
  service_type: string
  frequency: string
  dogs: number
  customers: {
    name: string
    email: string
  }
  service_days: {
    day_of_week: number
  }[]
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]

export default function AdminDashboardClient({ accessToken }: AdminDashboardClientProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: ""
        })

        const { data, error } = await supabase
          .from("bookings")
          .select(`
            id,
            created_at,
            status,
            price,
            service_type,
            frequency,
            dogs,
            customers:customer_id(name, email),
            service_days(day_of_week)
          `)
          .order("created_at", { ascending: false })

        if (error) throw new Error(error.message)
        setBookings(data as Booking[])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [accessToken])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium">Recent Bookings</h2>
          </div>
          <div className="border-t border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.customers.name}</div>
                      <div className="text-sm text-gray-500">{booking.customers.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.service_type === "one-time"
                          ? "One-Time Cleanup"
                          : `${booking.frequency === "weekly" ? "Weekly" : "Twice Weekly"} (${booking.dogs} ${
                              booking.dogs > 1 ? "Dogs" : "Dog"
                            })`}
                      </div>
                      {booking.service_type === "regular" && (
                        <div className="text-sm text-gray-500">
                          Days: {booking.service_days.map((d) => WEEKDAYS[d.day_of_week - 1]).join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${booking.price}
                      {booking.service_type === "regular" ? "/month" : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                          booking.status === "active"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "paused"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                        new Date(booking.created_at)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
