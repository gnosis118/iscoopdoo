import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Initialize database using Supabase
    const supabase = createServerSupabaseClient()

    // Create tables if they don't exist
    await supabase.rpc("create_tables_if_not_exist")

    // Initialize database using Prisma
    await prisma.$executeRaw`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `

    // Sync Prisma schema with database
    await prisma.$executeRaw`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
          CREATE TABLE "public"."customers" (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "name" TEXT NOT NULL,
            "email" TEXT UNIQUE NOT NULL,
            "phone" TEXT,
            "address" TEXT NOT NULL,
            "city" TEXT NOT NULL,
            "state" TEXT NOT NULL,
            "zip" TEXT NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
          CREATE TABLE "public"."bookings" (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "customer_id" UUID REFERENCES customers(id) ON DELETE CASCADE,
            "service_type" TEXT NOT NULL CHECK (service_type IN ('one-time', 'regular')),
            "frequency" TEXT CHECK (frequency IN ('weekly', 'twice-weekly')),
            "dogs" INTEGER NOT NULL CHECK (dogs BETWEEN 1 AND 3),
            "price" DECIMAL(10, 2) NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
            "special_instructions" TEXT,
            "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_days') THEN
          CREATE TABLE "public"."service_days" (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "booking_id" UUID REFERENCES bookings(id) ON DELETE CASCADE,
            "day_of_week" INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
            "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END IF;
      END
      $$;
    `

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
