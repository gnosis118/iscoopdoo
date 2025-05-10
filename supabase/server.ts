import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

export function createServerClient() {
  return createServerComponentClient({
    cookies: () => cookies(),
    headers: () => headers(),
  })
}
