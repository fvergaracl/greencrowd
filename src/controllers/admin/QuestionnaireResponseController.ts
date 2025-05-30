import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"

export default class QuestionnaireResponseController {
  @withPrismaDisconnect
  static async getAllQuestionnaireResponse(userId: string): Promise<any[]> {
    // get all createdat of UserTaskResponse
    // const userTaskResponses = await prisma.userTaskResponse.findMany({
    //   where: {
    //     user: { sub: userId },
    //     task: { pointOfInterestId: POIId }
    //   },
    //   select: {
    //     createdAt: true,
    //     task: { select: { id: true } }
    //   }
    // })

    return []
  }

  @withPrismaDisconnect
  static async createNewResponse(data: any) {
    return prisma.questionnaireResponse.create({ data })
  }
}
