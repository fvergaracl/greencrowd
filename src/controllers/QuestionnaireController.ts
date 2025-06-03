import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"

export default class QuestionnaireController {
  /**
   * Get a single questionnaire by ID, ensuring the user has access to its campaign.
   * @param questionnaireId ID of the questionnaire
   * @param userSub user's sub from Keycloak
   */
  @withPrismaDisconnect
  static async getOneByIdWithAccessCheck(
    questionnaireId: string,
    userSub: string
  ) {
    const user = await prisma.user.findUnique({
      where: { sub: userSub },
      select: { id: true }
    })

    if (!user) {
      throw new Error("User not found")
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
      include: {
        campaign: {
          include: {
            allowedUsers: {
              where: { userId: user.id }
            }
          }
        }
      }
    })

    if (!questionnaire) {
      throw new Error("Questionnaire not found")
    }

    const campaign = questionnaire.campaign

    const userHasAccess =
      campaign?.allowedUsers.length > 0 ||
      (!campaign?.isDisabled &&
        (!campaign?.startDatetime || campaign.startDatetime <= new Date()) &&
        (!campaign?.endDatetime || campaign.endDatetime >= new Date()))

    if (!userHasAccess) {
      throw new Error("Access denied to this campaign")
    }

    return {
      ...questionnaire,
      campaign: {
        id: campaign.id,
        name: campaign.name
      }
    }
  }
}
