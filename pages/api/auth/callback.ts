import type { NextApiRequest, NextApiResponse } from "next"
import { supabasePages } from "@/lib/supabase-pages"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query

  if (code) {
    await supabasePages.auth.exchangeCodeForSession(String(code))
  }

  return res.redirect("/")
}
