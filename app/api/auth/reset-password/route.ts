import { NextResponse } from "next/server"
import { createClient } from "@/supabase/server"

export async function POST(req: Request) {
  const { token, password } = await req.json()
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: "Password successfully reset." })
}
