import { cookies } from "next/headers"
import { createClient as createSupabaseClient } from "@/app/utils/supabase/server"

// Re-export the createClient function as createServerClient for backward compatibility
export const createServerClient = () => {
  const cookieStore = cookies()
  return createSupabaseClient(cookieStore)
}

// Also export a createClient function for newer code
export const createClient = () => {
  const cookieStore = cookies()
  return createSupabaseClient(cookieStore)
}
