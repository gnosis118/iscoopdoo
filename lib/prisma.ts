import { PrismaClient } from "@prisma/client"

// This approach prevents multiple instances of Prisma Client in development
// and ensures we don't crash if Prisma Client hasn't been generated yet

// Declare global variable for PrismaClient
declare global {
  var prisma: PrismaClient | undefined
}

// Function to create a new PrismaClient instance
function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })
  } catch (error) {
    console.error("Failed to create Prisma client:", error)
    // Return a mock client that will throw a more helpful error when used
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error(
          "Prisma Client has not been generated. Please run 'npx prisma generate' before using Prisma Client.",
        )
      },
    })
  }
}

// Use existing prisma instance if available to avoid multiple instances during development
export const prisma = global.prisma || createPrismaClient()

// Assign to global object in non-production environments
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

// Helpful function to check if Prisma is connected
export async function checkPrismaConnection() {
  try {
    // Try a simple query
    await prisma.$queryRaw`SELECT 1 as test`
    return { connected: true }
  } catch (error) {
    console.error("Prisma connection error:", error)
    return { connected: false, error }
  }
}
