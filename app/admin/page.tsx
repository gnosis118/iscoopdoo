import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated and has admin role
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  // Get user's role from user_metadata
  const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()

  if (!userData || userData.role !== "admin") {
    redirect("/")
  }

  // Fetch all bookings with customer data
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      customers:customer_id(*),
      service_days(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
    return <div>Error loading bookings</div>
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium">Recent Bookings</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking: any) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.customers.name}</div>
                        <div className="text-sm text-gray-500">{booking.customers.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.service_type === "one-time"
                            ? "One-Time Cleanup"
                            : `${booking.frequency === "weekly" ? "Weekly" : "Twice Weekly"} (${booking.dogs} ${booking.dogs > 1 ? "Dogs" : "Dog"})`}
                        </div>
                        {booking.service_type === "regular" && (
                          <div className="text-sm text-gray-500">
                            Days:{" "}
                            {booking.service_days
                              .map((day: any) => ["Mon", "Tue", "Wed", "Thu", "Fri"][day.day_of_week - 1])
                              .join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${booking.price}
                          {booking.service_type === "regular" ? "/month" : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
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
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
