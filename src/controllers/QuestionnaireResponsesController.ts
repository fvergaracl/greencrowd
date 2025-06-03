import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"
import questionnaireController from "@/controllers/QuestionnaireController"
import { startOfDay, subDays } from "date-fns"
import type { Questionnaire } from "@prisma/client"

type PendingQuestionnaire = Questionnaire & { reason: string }

export default class QuestionnaireResponsesController {
  /**
   * Get all pending questionnaires for a given user in a specific campaign.
   */
  @withPrismaDisconnect
  static async getPendingQuestionnaires(
    userId: string,
    campaignId: string
  ): Promise<PendingQuestionnaire[]> {
    const now = new Date()

    // 1. Get campaign info (to know if it's closed)
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        isDisabled: true,
        endDatetime: true
      }
    })

    if (!campaign) {
      console.warn(
        `[getPendingQuestionnaires] Campaign not found: ${campaignId}`
      )
      return []
    }

    const isCampaignClosed =
      campaign.isDisabled === true ||
      (campaign.endDatetime !== null &&
        campaign.endDatetime.getTime() < now.getTime())

    // 2. Get all questionnaires in the campaign
    const questionnaires = await prisma.questionnaire.findMany({
      where: { campaignId }
    })

    // 3. Get last response per questionnaire for this user
    const responses = await prisma.questionnaireResponse.findMany({
      where: {
        userId,
        questionnaireId: {
          in: questionnaires.map(q => q.id)
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Mapeamos la última respuesta por cuestionario
    const lastResponseByQuestionnaire = new Map<string, Date>()
    for (const response of responses) {
      if (!lastResponseByQuestionnaire.has(response.questionnaireId)) {
        lastResponseByQuestionnaire.set(
          response.questionnaireId,
          response.createdAt
        )
      }
    }

    // 4. Evaluar si está pendiente o no
    const pending: PendingQuestionnaire[] = []

    for (const questionnaire of questionnaires) {
      const lastResponseDate =
        lastResponseByQuestionnaire.get(questionnaire.id) ?? null

      const reason = QuestionnaireResponsesController.isQuestionnairePending({
        questionnaire,
        lastResponseDate,
        isCampaignClosed,
        now
      })

      if (reason) {
        pending.push({
          ...questionnaire,
          reason
        })
      }
    }

    return pending
  }

  /**
   * Determines if a questionnaire is pending and returns a string reason if so.
   */
  private static isQuestionnairePending({
    questionnaire,
    lastResponseDate,
    isCampaignClosed,
    now
  }: {
    questionnaire: Questionnaire
    lastResponseDate: Date | null
    isCampaignClosed: boolean
    now: Date
  }): string | false {
    switch (questionnaire.condition) {
      case "BEFORE":
        return !lastResponseDate ? "BEFORE: never answered" : false

      case "AFTER":
        return isCampaignClosed && !lastResponseDate
          ? "AFTER: campaign closed and never answered"
          : false

      case "DAILY":
        return !lastResponseDate || lastResponseDate < startOfDay(now)
          ? "DAILY: no answer today"
          : false

      case "EVERY_X_DAYS":
        return !questionnaire.frequencyInDays
          ? false
          : !lastResponseDate ||
              lastResponseDate < subDays(now, questionnaire.frequencyInDays)
            ? `EVERY_X_DAYS: last response too old`
            : false

      default:
        return false
    }
  }

  // create response

  /**
   * Creates a new questionnaire response for a user, if allowed by its condition.
   *
   * - Prevents duplicate responses based on `QuestionnaireCondition`
   * - Validates user and questionnaire access
   * - Persists response with metadata
   *
   * @param questionnaireId - ID of the questionnaire
   * @param userSub - External user identifier (Keycloak `sub`)
   * @param questionnaireResponse - Answer payload (form data)
   * @param questionnaireData - Optional schema snapshot at time of submission
   * @returns An object containing the saved response ID and timestamp
   * @throws Error if user or questionnaire is invalid, or if response already exists under condition
   */
  @withPrismaDisconnect
  static async saveResponse({
    questionnaireId,
    userSub,
    questionnaireResponse,
    questionnaireData
  }: {
    questionnaireId: string
    userSub: string
    questionnaireResponse: Record<string, any>
    questionnaireData?: any
  }) {
    const questionnaire =
      await questionnaireController.getOneByIdWithAccessCheck(
        questionnaireId,
        userSub
      )

    const user = await prisma.user.findUnique({
      where: { sub: userSub },
      select: { id: true }
    })

    if (!user) {
      throw new Error("User not found")
    }

    const lastResponse = await prisma.questionnaireResponse.findFirst({
      where: {
        userId: user.id,
        questionnaireId
      },
      orderBy: { createdAt: "desc" }
    })

    const now = new Date()

    switch (questionnaire.condition) {
      case "BEFORE":
      case "AFTER":
        if (lastResponse) {
          throw new Error("This questionnaire has already been answered.")
        }
        break

      case "DAILY":
        if (
          lastResponse &&
          lastResponse.createdAt >= new Date(now.setHours(0, 0, 0, 0))
        ) {
          throw new Error(
            "This questionnaire can only be answered once per day."
          )
        }
        break

      case "EVERY_X_DAYS":
        if (
          questionnaire.frequencyInDays &&
          lastResponse &&
          lastResponse.createdAt >=
            new Date(
              now.getTime() -
                questionnaire.frequencyInDays * 24 * 60 * 60 * 1000
            )
        ) {
          throw new Error(
            `This questionnaire can only be answered every ${questionnaire.frequencyInDays} days.`
          )
        }
        break
    }

    // 4. Save new response
    const saved = await prisma.questionnaireResponse.create({
      data: {
        userId: user.id,
        questionnaireId,
        condition: questionnaire.condition,
        questionnaireData: questionnaireData || questionnaire.questionnaireData,
        questionnaireResponse
      }
    })

    return {
      responseId: saved.id,
      createdAt: saved.createdAt
    }
  }
}
