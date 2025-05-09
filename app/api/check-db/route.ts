import { NextResponse } from "next/server"
import { checkPrismaConnection } from "@/lib/prisma"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const response: any = {
    timestamp: new Date().toISOString(),
    environmentVariables: {
      POSTGRES_HOST: process.env.POSTGRES_HOST ? "Set" : "Not set",
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE ? "Set" : "Not set",
      POSTGRES_USER: process.env.POSTGRES_USER ? "Set" : "Not set",
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? "Set" : "Not set (expected)",
      POSTGRES_URL: process.env.POSTGRES_URL ? "Set" : "Not set",
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? "Set" : "Not set",
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "Set" : "Not set",
      SUPABASE_URL: process.env.SUPABASE_URL ? "Set" : "Not set",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "Set" : "Not set (expected)",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
    },
  }

  // Check Prisma connection
  try {
    const prismaConnectionStatus = await checkPrismaConnection()
    response.prismaConnection = prismaConnectionStatus.connected ? "Connected successfully" : "Connection failed"
    response.prismaError = prismaConnectionStatus.connected ? null : prismaConnectionStatus.error
  } catch (error) {
    response.prismaConnection = "Connection failed"
    response.prismaError = error instanceof Error ? error.message : "Unknown Prisma error"
  }

  // Check Supabase connection
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("customers").select("count(*)", { count: "exact" })

    if (error) {
      response.supabaseConnection = "Connection failed"
      response.supabaseError = error.message
    } else {
      response.supabaseConnection = "Connected successfully"
      response.supabaseResult = data
    }
  } catch (error) {
    response.supabaseConnection = "Connection failed"
    response.supabaseError = error instanceof Error ? error.message : "Unknown Supabase error"
  }

  // Set overall success status
  response.success =
    response.prismaConnection === "Connected successfully" && response.supabaseConnection === "Connected successfully"

  return NextResponse.json(response)
}
