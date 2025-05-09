import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
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

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="max-w-2xl">
        <ProfileForm initialData={profile || undefined} />
      </div>
    </div>
  )
}
