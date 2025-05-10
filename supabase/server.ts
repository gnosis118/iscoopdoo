import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"

// Export the createServerClient function directly as a named export
export const createServerClient = () => {
  return createServerComponentClient({
    cookies: () => cookies(),
    headers: () => headers(),
  })
}

// Also export createClient for consistency
export const createClient = createServerClient
