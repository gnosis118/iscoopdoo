import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/app/utils/supabase/server"

export async function POST(req: Request) {
  const { token, password } = await req.json()
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: "Password successfully reset." })
}
