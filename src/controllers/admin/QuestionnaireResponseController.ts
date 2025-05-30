import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"
import { isUUID } from "@/utils/isUUID"

export default class QuestionnaireResponseController {
  @withPrismaDisconnect
  static async createNewResponse(data: {
    userId: string
    questionnaireId: string
    questionnaireResponse: any
  }) {
    const { userId, questionnaireId, questionnaireResponse } = data

    if (!isUUID(userId)) {
      throw new Error("Invalid userId")
    }

    if (!isUUID(questionnaireId)) {
      throw new Error("Invalid questionnaireId")
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
    })

    if (!questionnaire) {
      throw new Error("Questionnaire not found")
    }

    const created = await prisma.questionnaireResponse.create({
      data: {
        userId,
        questionnaireId,
        condition: questionnaire.condition,
        questionnaireData: questionnaire.questionnaireData,
        questionnaireResponse,
      },
    })

    return created
  }
}
