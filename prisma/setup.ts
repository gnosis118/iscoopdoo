import { PrismaClient } from "@prisma/client"

// This file is used to ensure Prisma client is generated during build
console.log("Setting up Prisma client...")

// Just instantiate the client to verify it works
const prisma = new PrismaClient()

async function main() {
  try {
    // Test the connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log("Prisma setup successful:", result)
  } catch (error) {
    console.error("Prisma setup error:", error)
    // Don't throw here, as we just want to generate the client
  } finally {
    await prisma.$disconnect()
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
    .then(() => console.log("Prisma setup complete"))
    .catch((e) => console.error("Prisma setup failed:", e))
}

export default prisma
