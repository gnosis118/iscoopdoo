import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/app/utils/supabase/server"

export async function POST(req: Request) {
  const { email } = await req.json()
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: "Password reset email sent." })
}
