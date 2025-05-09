"use client"

import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, SearchIcon } from "lucide-react"

export default async function AdminBookingsPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
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

  // Build query
  let query = supabase
    .from("bookings")
    .select(`
      *,
      customers:customer_id(name, email, phone, address, city, state, zip),
      service_days(*)
    `)
    .order("created_at", { ascending: false })

  // Apply status filter
  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }

  // Apply search filter
  if (searchParams.q) {
    query = query.or(`customers.name.ilike.%${searchParams.q}%,customers.email.ilike.%${searchParams.q}%`)
  }

  // Get bookings
  const { data: bookings, error } = await query

  if (error) {
    console.error("Error fetching bookings:", error)
    return <div>Error loading bookings</div>
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Bookings</h1>
        <Button asChild>
          <Link href="/admin/bookings/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Booking
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Booking Filters</CardTitle>
          <CardDescription>Filter and search bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <form>
                  <Input
                    name="q"
                    placeholder="Search by customer name or email"
                    className="pl-10"
                    defaultValue={searchParams.q || ""}
                  />
                </form>
              </div>
            </div>
            <div className="w-full md:w-48">
              <form>
                <Select
                  name="status"
                  defaultValue={searchParams.status || "all"}
                  onValueChange={(value) => {
                    const url = new URL(window.location.href)
                    if (value === "all") {
                      url.searchParams.delete("status")
                    } else {
                      url.searchParams.set("status", value)
                    }
                    window.location.href = url.toString()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            {bookings?.length} booking{bookings?.length === 1 ? "" : "s"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="one-time">One-Time</TabsTrigger>
              <TabsTrigger value="regular">Regular</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <BookingsTable bookings={bookings || []} />
            </TabsContent>
            <TabsContent value="one-time">
              <BookingsTable bookings={(bookings || []).filter((booking) => booking.service_type === "one-time")} />
            </TabsContent>
            <TabsContent value="regular">
              <BookingsTable bookings={(bookings || []).filter((booking) => booking.service_type === "regular")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function BookingsTable({ bookings }: { bookings: any[] }) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No bookings found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2">Customer</th>
            <th className="text-left py-3 px-2">Service</th>
            <th className="text-left py-3 px-2">Date</th>
            <th className="text-left py-3 px-2">Status</th>
            <th className="text-left py-3 px-2">Payment</th>
            <th className="text-left py-3 px-2">Price</th>
            <th className="text-left py-3 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
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
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full 
                  ${
                    booking.payment_status === "completed"
                      ? "bg-green-100 text-green-800"
                      : booking.payment_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                </span>
              </td>
              <td className="py-3 px-2">
                ${booking.price}
                {booking.service_type === "regular" ? "/month" : ""}
              </td>
              <td className="py-3 px-2">
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/bookings/${booking.id}`}>View</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/bookings/${booking.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
