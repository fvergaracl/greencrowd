import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"

export default class QuestionnaireController {
  @withPrismaDisconnect
  static async getAllQuestionnaires(): Promise<any[]> {
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
  static async getAllQuestionnairesByCampaignId(
    campaignId: string
  ): Promise<any[]> {
    if (!campaignId) {
      return []
    }
    const questionnaires = await prisma.questionnaire.findMany({
      where: {
        campaignId: campaignId as string
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    return questionnaires.map(q => ({
      id: q.id,
      title: q.title,
      condition: q.condition,
      frequencyInDays: q.frequencyInDays,
      questionnaireData: q.questionnaireData
    }))
  }

  @withPrismaDisconnect
  static async getQuestionnaireById(id: string): Promise<any | null> {
    if (!id) {
      return null
    }
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id }
    })
    if (!questionnaire) {
      return null
    }
    return {
      id: questionnaire.id,
      title: questionnaire.title,
      condition: questionnaire.condition,
      frequencyInDays: questionnaire.frequencyInDays,
      questionnaireData: questionnaire.questionnaireData
    }
  }

  @withPrismaDisconnect
  static async updateQuestionnaire(id: string, data: any): Promise<any | null> {
    console.log("--------------- updateQuestionnaire")
    console.log("--------------- updateQuestionnaire")
    console.log("--------------- updateQuestionnaire")
    console.log("--------------- updateQuestionnaire")
    if (!id) {
      return null
    }
    const updatedQuestionnaire = await prisma.questionnaire.update({
      where: { id },
      data
    })
    if (!updatedQuestionnaire) {
      return null
    }
    return {
      id: updatedQuestionnaire.id,
      title: updatedQuestionnaire.title,
      condition: updatedQuestionnaire.condition,
      frequencyInDays: updatedQuestionnaire.frequencyInDays,
      questionnaireData: updatedQuestionnaire.questionnaireData
    }
  }

  @withPrismaDisconnect
  static async createQuestionnaire(data: any) {
    return prisma.questionnaire.create({ data })
  }
}
