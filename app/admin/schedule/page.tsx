import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from "lucide-react"

export default async function AdminSchedulePage() {
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

  // Get all active bookings with service days
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      customer_id,
      service_type,
      frequency,
      dogs,
      status,
      customers:customer_id(name, email, phone, address, city, state, zip),
      service_days(day_of_week)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  // Get today's day of week (1-7, where 1 is Monday)
  const today = new Date()
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()

  // Filter bookings for today
  const todaysBookings = bookings?.filter((booking) => {
    if (booking.service_type === "one-time") {
      // For one-time bookings, check if they were created today
      const bookingDate = new Date(booking.created_at)
      return (
        bookingDate.getDate() === today.getDate() &&
        bookingDate.getMonth() === today.getMonth() &&
        bookingDate.getFullYear() === today.getFullYear()
      )
    } else {
      // For regular bookings, check if today is a service day
      return booking.service_days.some((day: any) => day.day_of_week === dayOfWeek)
    }
  })

  // Get the next 7 days
  const nextWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      date,
      dayOfWeek: date.getDay() === 0 ? 7 : date.getDay(),
      dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
      dateString: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }
  })

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Service Schedule</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Previous Week
          </Button>
          <Button variant="outline">
            Next Week
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/schedule/print">Print Schedule</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todaysBookings && todaysBookings.length > 0 ? (
            <div className="space-y-4">
              {todaysBookings.map((booking) => (
                <div key={booking.id} className="flex items-start p-4 border rounded-lg hover:bg-muted/50">
                  <div className="mr-4 mt-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{booking.customers.name}</h3>
                        <p className="text-sm text-muted-foreground">{booking.customers.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {booking.service_type === "one-time"
                            ? "One-Time Cleanup"
                            : `${booking.frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service`}
                        </p>
                        <p className="text-sm text-muted-foreground">{booking.dogs} Dog(s)</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-start">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground mr-1 mt-0.5" />
                      <p className="text-sm">
                        {booking.customers.address}, {booking.customers.city}, {booking.customers.state}{" "}
                        {booking.customers.zip}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/bookings/${booking.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No services scheduled for today</h3>
              <p className="text-muted-foreground">There are no bookings scheduled for today.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>View and manage upcoming services</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={dayOfWeek.toString()}>
            <TabsList className="mb-4 grid grid-cols-7">
              {nextWeek.map((day) => (
                <TabsTrigger key={day.dayOfWeek} value={day.dayOfWeek.toString()}>
                  <div className="text-center">
                    <div className="text-xs">{day.dayName.substring(0, 3)}</div>
                    <div className="font-medium">{day.dateString}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {nextWeek.map((day) => (
              <TabsContent key={day.dayOfWeek} value={day.dayOfWeek.toString()}>
                <h3 className="font-medium text-lg mb-4">
                  {day.dayName}, {day.dateString}
                </h3>

                {bookings
                  ?.filter((booking) => {
                    if (booking.service_type === "one-time") {
                      // For one-time bookings, check if they were created on this day
                      const bookingDate = new Date(booking.created_at)
                      return (
                        bookingDate.getDate() === day.date.getDate() &&
                        bookingDate.getMonth() === day.date.getMonth() &&
                        bookingDate.getFullYear() === day.date.getFullYear()
                      )
                    } else {
                      // For regular bookings, check if this day is a service day
                      return booking.service_days.some((serviceDay: any) => serviceDay.day_of_week === day.dayOfWeek)
                    }
                  })
                  .map((booking) => (
                    <div key={booking.id} className="flex items-start p-4 border rounded-lg hover:bg-muted/50 mb-4">
                      <div className="mr-4 mt-1">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{booking.customers.name}</h3>
                            <p className="text-sm text-muted-foreground">{booking.customers.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {booking.service_type === "one-time"
                                ? "One-Time Cleanup"
                                : `${booking.frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service`}
                            </p>
                            <p className="text-sm text-muted-foreground">{booking.dogs} Dog(s)</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-start">
                          <MapPinIcon className="h-4 w-4 text-muted-foreground mr-1 mt-0.5" />
                          <p className="text-sm">
                            {booking.customers.address}, {booking.customers.city}, {booking.customers.state}{" "}
                            {booking.customers.zip}
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/bookings/${booking.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {bookings?.filter((booking) => {
                  if (booking.service_type === "one-time") {
                    const bookingDate = new Date(booking.created_at)
                    return (
                      bookingDate.getDate() === day.date.getDate() &&
                      bookingDate.getMonth() === day.date.getMonth() &&
                      bookingDate.getFullYear() === day.date.getFullYear()
                    )
                  } else {
                    return booking.service_days.some((serviceDay: any) => serviceDay.day_of_week === day.dayOfWeek)
                  }
                }).length === 0 && (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No services scheduled</h3>
                    <p className="text-muted-foreground">There are no bookings scheduled for this day.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
