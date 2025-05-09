import { createServerClient } from "@/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboardClient from "@/components/admin/AdminDashboardClient"

export default async function AdminDashboardServer() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/login")

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (userError || !userData || userData.role !== "admin") {
    redirect("/")
  }

  return <AdminDashboardClient accessToken={session.access_token} />
}
