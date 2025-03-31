import { PrismaClient } from "@prisma/client"

declare global {
  // Avoid creating multiple instances in development
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["warn", "error"]
  })

if (process.env.NODE_ENV !== "production") global.prisma = prisma

export default prisma
