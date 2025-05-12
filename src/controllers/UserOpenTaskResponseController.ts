import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"

export default class UserOpenTaskResponseController {
  @withPrismaDisconnect
  static async getResponsesOfUserByOpenTaskId(
    userId: string,
    openTaskId: string
  ) {
    return prisma.openTaskResponse.findMany({
      where: {
        userId,
        openTaskId
      }
    })
  }

  @withPrismaDisconnect
  static async createNewResponse(data: any) {
    return prisma.openTaskResponse.create({ data })
  }
}
