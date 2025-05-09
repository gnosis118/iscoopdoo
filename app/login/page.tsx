import { AuthForm } from "@/components/auth/auth-form"
import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-12">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-3xl font-bold mb-8 text-center">iScoopDoo</h1>
        <AuthForm />
      </div>
    </div>
  )
}
