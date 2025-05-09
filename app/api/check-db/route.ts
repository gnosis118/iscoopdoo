import { NextResponse } from "next/server"
import { prisma, checkPrismaConnection } from "@/lib/prisma"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    // Check Prisma connection
    const prismaConnectionStatus = await checkPrismaConnection()

    if (!prismaConnectionStatus.connected) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to Prisma",
          details: prismaConnectionStatus.error,
          environmentVariables: {
            POSTGRES_HOST: process.env.POSTGRES_HOST ? "Set" : "Not set",
            POSTGRES_DATABASE: process.env.POSTGRES_DATABASE ? "Set" : "Not set",
            POSTGRES_USER: process.env.POSTGRES_USER ? "Set" : "Not set",
            POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? "Set" : "Not set (expected)",
            POSTGRES_URL: process.env.POSTGRES_URL ? "Set" : "Not set",
            POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? "Set" : "Not set",
            POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "Set" : "Not set",
          },
        },
        { status: 500 },
      )
    }

    const prismaResult = await prisma.$queryRaw`SELECT current_timestamp as time`

    // Check Supabase connection
    const supabase = createServerSupabaseClient()
    const { data: supabaseResult, error } = await supabase.from("customers").select("count(*)", { count: "exact" })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      prismaConnection: "Connected successfully",
      prismaTime: prismaResult,
      supabaseConnection: "Connected successfully",
      customerCount: supabaseResult,
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
    })
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
