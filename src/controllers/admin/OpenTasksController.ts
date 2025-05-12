import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"

export default class OpenTaskController {
  @withPrismaDisconnect
  static async getAllOpenTasks() {
    return await prisma.openTask.findMany({
      where: {
        isDisabled: false,
        area: {
          isDisabled: false,
          campaign: {
            isDisabled: false
          }
        }
      },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            campaign: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        responses: {
          select: {
            id: true,
            data: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                alias: true
              }
            }
          }
        }
      }
    })
  }

  @withPrismaDisconnect
  static async getOpenTaskById(id: string) {
    return await prisma.openTask.findUnique({
      where: { id },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            campaign: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })
  }

  @withPrismaDisconnect
  static async getAllOpenTasksByArea(areaId: string) {
    return await prisma.openTask.findMany({
      where: {
        areaId,
        isDisabled: false,
        area: {
          isDisabled: false,
          campaign: {
            isDisabled: false
          }
        }
      },
      include: {
        area: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  @withPrismaDisconnect
  static async createOpenTask(data: any) {
    return await prisma.openTask.create({ data })
  }

  @withPrismaDisconnect
  static async updateOpenTask(id: string, data: any) {
    return await prisma.openTask.update({
      where: { id },
      data
    })
  }

  @withPrismaDisconnect
  static async deleteOpenTask(id: string) {
    return await prisma.openTask.delete({
      where: { id }
    })
  }
}
