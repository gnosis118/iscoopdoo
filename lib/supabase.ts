// lib/supabase.ts

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for app directory with auth)
export const createServerSupabaseClient = () => {
  return createServerComponentClient({
    cookies: () => cookies(),
    headers: () => headers(),
  })
}
