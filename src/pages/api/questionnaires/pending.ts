import type { NextApiRequest, NextApiResponse } from "next"
import { validateKeycloakToken } from "@/utils/validateToken"
import { prisma } from "@/utils/withPrismaDisconnect"
import QuestionnaireResponsesController from "@/controllers/QuestionnaireResponsesController"

/**
 * GET /api/questionnaires/pending
 *
 * Returns the list of pending questionnaires for the authenticated user within a specific campaign.
 * Requires a valid Keycloak token.
 *
 * Query Parameters:
 * - campaignId: string (required)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  try {
    const { userId: userSub } = await validateKeycloakToken(req, res)

    const campaignId = req.query.campaignId as string | undefined

    if (!campaignId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: campaignId" })
    }

    const user = await prisma.user.findUnique({
      where: { sub: userSub },
      select: { id: true }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const pending =
      await QuestionnaireResponsesController.getPendingQuestionnaires(
        user.id,
        campaignId
      )

    return res.status(200).json({
      success: true,
      count: pending.length,
      pending
    })
  } catch (error: unknown) {
    console.error("Error in /api/questionnaires/pending:", error)

    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    })
  }
}
