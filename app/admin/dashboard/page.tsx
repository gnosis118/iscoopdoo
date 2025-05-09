import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, ClipboardListIcon, DollarSignIcon, UsersIcon } from "lucide-react"

export default async function AdminDashboardPage() {
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

  // Get counts for dashboard
  const { data: bookingsCount } = await supabase.from("bookings").select("id", { count: "exact", head: true })
  const { data: customersCount } = await supabase.from("customers").select("id", { count: "exact", head: true })
  const { data: pendingBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("payment_status", "pending")

  // Get recent bookings
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      customers:customer_id(name, email, phone, address, city, state, zip),
      service_days(*)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate revenue
  const { data: revenue } = await supabase
    .from("bookings")
    .select("price, service_type")
    .eq("payment_status", "completed")

  const oneTimeRevenue = revenue
    ? revenue.filter((booking) => booking.service_type === "one-time").reduce((sum, booking) => sum + booking.price, 0)
    : 0
  const recurringRevenue = revenue
    ? revenue.filter((booking) => booking.service_type === "regular").reduce((sum, booking) => sum + booking.price, 0)
    : 0
  const totalRevenue = oneTimeRevenue + recurringRevenue

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button asChild>
          <Link href="/admin/schedule">View Schedule</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <DashboardCard
          title="Total Bookings"
          value={bookingsCount?.count?.toString() || "0"}
          description="All-time bookings"
          icon={<ClipboardListIcon className="h-5 w-5" />}
          href="/admin/bookings"
        />
        <DashboardCard
          title="Customers"
          value={customersCount?.count?.toString() || "0"}
          description="Registered customers"
          icon={<UsersIcon className="h-5 w-5" />}
          href="/admin/customers"
        />
        <DashboardCard
          title="Pending Bookings"
          value={pendingBookings?.count?.toString() || "0"}
          description="Awaiting payment"
          icon={<CalendarIcon className="h-5 w-5" />}
          href="/admin/bookings?status=pending"
        />
        <DashboardCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          description="From completed bookings"
          icon={<DollarSignIcon className="h-5 w-5" />}
          href="/admin/revenue"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">One-Time Services</p>
                  <p className="text-2xl font-bold">${oneTimeRevenue.toFixed(2)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSignIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Recurring Services</p>
                  <p className="text-2xl font-bold">${recurringRevenue.toFixed(2)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-20 flex flex-col">
                <Link href="/admin/bookings/new">
                  <ClipboardListIcon className="h-5 w-5 mb-1" />
                  <span>New Booking</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col">
                <Link href="/admin/customers/new">
                  <UsersIcon className="h-5 w-5 mb-1" />
                  <span>Add Customer</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col">
                <Link href="/admin/schedule">
                  <CalendarIcon className="h-5 w-5 mb-1" />
                  <span>Today's Schedule</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col">
                <Link href="/admin/reports">
                  <DollarSignIcon className="h-5 w-5 mb-1" />
                  <span>Run Reports</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest service bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Customer</th>
                      <th className="text-left py-3 px-2">Service</th>
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Price</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings?.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium">{booking.customers.name}</p>
                            <p className="text-sm text-muted-foreground">{booking.customers.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {booking.service_type === "one-time"
                            ? "One-Time Cleanup"
                            : `${booking.frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service`}
                        </td>
                        <td className="py-3 px-2">{new Date(booking.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full 
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
                        <td className="py-3 px-2">
                          ${booking.price}
                          {booking.service_type === "regular" ? "/month" : ""}
                        </td>
                        <td className="py-3 px-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/bookings/${booking.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="pending">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Customer</th>
                      <th className="text-left py-3 px-2">Service</th>
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Price</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings
                      ?.filter((booking) => booking.payment_status === "pending")
                      .map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{booking.customers.name}</p>
                              <p className="text-sm text-muted-foreground">{booking.customers.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            {booking.service_type === "one-time"
                              ? "One-Time Cleanup"
                              : `${booking.frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service`}
                          </td>
                          <td className="py-3 px-2">{new Date(booking.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full 
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
                          <td className="py-3 px-2">
                            ${booking.price}
                            {booking.service_type === "regular" ? "/month" : ""}
                          </td>
                          <td className="py-3 px-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/bookings/${booking.id}`}>View</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="completed">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Customer</th>
                      <th className="text-left py-3 px-2">Service</th>
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Price</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings
                      ?.filter((booking) => booking.payment_status === "completed")
                      .map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{booking.customers.name}</p>
                              <p className="text-sm text-muted-foreground">{booking.customers.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            {booking.service_type === "one-time"
                              ? "One-Time Cleanup"
                              : `${booking.frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service`}
                          </td>
                          <td className="py-3 px-2">{new Date(booking.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full 
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
                          <td className="py-3 px-2">
                            ${booking.price}
                            {booking.service_type === "regular" ? "/month" : ""}
                          </td>
                          <td className="py-3 px-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/bookings/${booking.id}`}>View</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardCard({
  title,
  value,
  description,
  icon,
  href,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1 flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
