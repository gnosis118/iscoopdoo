import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, ClipboardListIcon, CreditCardIcon, LogOutIcon, UserIcon } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("customers").select("*").eq("id", session.user.id).single()

  // Get user's bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      service_days (*)
    `)
    .eq("customer_id", session.user.id)
    .order("created_at", { ascending: false })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <form action={handleSignOut}>
          <Button variant="outline" size="sm">
            <LogOutIcon className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <DashboardCard
          title="My Bookings"
          description="View and manage your service bookings"
          icon={<CalendarIcon className="h-5 w-5" />}
          href="/dashboard/bookings"
        />
        <DashboardCard
          title="My Profile"
          description="Update your personal information"
          icon={<UserIcon className="h-5 w-5" />}
          href="/dashboard/profile"
        />
        <DashboardCard
          title="Billing"
          description="View payment history and update payment method"
          icon={<CreditCardIcon className="h-5 w-5" />}
          href="/dashboard/billing"
        />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Recent Bookings</h2>

        {bookings && bookings.length > 0 ? (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <ClipboardListIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't made any bookings yet. Book your first service now!
                </p>
                <Button asChild>
                  <Link href="/book">Book a Service</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-full">{icon}</div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={href}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function BookingCard({ booking }: { booking: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {booking.service_type === "one-time"
              ? "One-Time Cleanup"
              : `${booking.frequency === "weekly" ? "Weekly" : "Twice Weekly"} Service`}
          </CardTitle>
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
        </div>
        <CardDescription>
          {new Date(booking.created_at).toLocaleDateString()} • {booking.dogs} {booking.dogs > 1 ? "Dogs" : "Dog"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price:</span>
            <span>
              ${booking.price}
              {booking.service_type === "regular" ? "/month" : ""}
            </span>
          </div>

          {booking.service_type === "regular" && booking.service_days && booking.service_days.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Days:</span>
              <span>
                {booking.service_days
                  .map((day: any) => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][day.day_of_week - 1])
                  .join(", ")}
              </span>
            </div>
          )}

          {booking.special_instructions && (
            <div className="text-sm mt-2">
              <span className="text-muted-foreground block">Special Instructions:</span>
              <span className="text-sm">{booking.special_instructions}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full">
          <Link href={`/dashboard/bookings/${booking.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
