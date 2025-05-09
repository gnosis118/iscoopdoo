import { createServerSupabaseClient } from "@/lib/supabase"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import AdminDashboardClient from "@/components/admin/AdminDashboardClient" // Make sure the path matches where you store your component

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient({
    headers: headers(),
    cookies: cookies(),
  })

  // Get session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect if no session (user not logged in)
  if (!session) {
    redirect("/login")
  }

  // Check if user has the 'admin' role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (!userData || userData.role !== "admin") {
    redirect("/")
  }

  // Fetch bookings from Supabase
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

  // Pass the access token and bookings to the client-side component
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {/* Pass the accessToken and bookings as props to the client-side component */}
      <AdminDashboardClient accessToken={session.access_token} bookings={bookings} />
    </div>
  )
}
