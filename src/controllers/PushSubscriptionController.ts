import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"

export default class PushSubscriptionController {
  @withPrismaDisconnect
  static async save(userSub: string, subscription: PushSubscriptionInput) {
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw new Error("Suscripción inválida")
    }

    const user = await prisma.user.findUnique({
      where: { sub: userSub },
      select: { id: true }
    })

    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    const result = await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: {
        userId: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys
      },
      update: {
        keys: subscription.keys,
        updatedAt: new Date()
      }
    })

    return result
  }
  @withPrismaDisconnect
  static async findAllNotifications() {
    return prisma.pushSubscription.findMany()
  }
  @withPrismaDisconnect
  static async findByUser(userSub: string) {
    const user = await prisma.user.findUnique({
      where: { sub: userSub },
      select: { id: true }
    })

    if (!user) {
      throw new Error("User not found")
    }

    return prisma.pushSubscription.findMany({
      where: { userId: user.id }
    })
  }
}

export interface PushSubscriptionInput {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}
