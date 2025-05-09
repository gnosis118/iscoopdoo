import { NextResponse } from "next/server"
import { checkPrismaConnection } from "@/lib/prisma"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    // Check Prisma connection
    const prismaConnectionStatus = await checkPrismaConnection()

    // Check Supabase connection
    let supabaseResult = null
    let supabaseError = null

    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase.from("customers").select("count(*)", { count: "exact" })

      if (error) {
        supabaseError = error.message
      } else {
        supabaseResult = data
      }
    } catch (error) {
      supabaseError = error instanceof Error ? error.message : "Unknown Supabase error"
    }

    return NextResponse.json(
      {
        success: prismaConnectionStatus.connected && !supabaseError,
        prismaConnection: prismaConnectionStatus.connected ? "Connected successfully" : "Connection failed",
        prismaError: prismaConnectionStatus.connected ? null : prismaConnectionStatus.error,
        supabaseConnection: supabaseError ? "Connection failed" : "Connected successfully",
        supabaseError,
        supabaseResult,
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
      },
      {
        status: prismaConnectionStatus.connected && !supabaseError ? 200 : 500,
      },
    )
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
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
      },
      { status: 500 },
    )
  }
}
