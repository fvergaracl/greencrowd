import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

/**
 * Decorator to automatically disconnect from Prisma after a method is called.
 */
export function withPrismaDisconnect(
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<any>
): TypedPropertyDescriptor<any> {
  if (!descriptor || typeof descriptor.value !== "function") {
    throw new Error("withPrismaDisconnect can only be applied to methods.")
  }

  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    try {
      // Execute the original method
      return await originalMethod.apply(this, args)
    } catch (error) {
      throw error
    } finally {
      // Ensure Prisma disconnect is called
      await prisma.$disconnect()
    }
  }

  return descriptor
}

export const prisma =
  global.prisma || new PrismaClient({ log: ["error", "warn"] })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}
