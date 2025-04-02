import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"

export default class PointOfInterestController {
  @withPrismaDisconnect
  static async getMyActivityInPOI(userId: string, POIId: string) {
    // get all createdat of UserTaskResponse
    const userTaskResponses = await prisma.userTaskResponse.findMany({
      where: {
        user: { sub: userId },
        task: { pointOfInterestId: POIId }
      },
      select: {
        createdAt: true,
        task: { select: { id: true } }
      }
    })

    return userTaskResponses
  }
}
