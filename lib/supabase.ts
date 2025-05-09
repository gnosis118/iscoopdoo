// lib/supabase.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client creation is moved to a separate function
// that will only be called in app directory components
export const createServerSupabaseClient = () => {
  // Dynamically import to prevent loading in pages directory
  const { cookies, headers } = require("next/headers")
  const { createServerComponentClient } = require("@supabase/auth-helpers-nextjs")

  return createServerComponentClient({
    cookies: () => cookies(),
    headers: () => headers(),
  })
}
