import type { NextApiRequest, NextApiResponse } from "next"
import { validateKeycloakToken } from "@/utils/validateToken"
import questionnaireController from "@/controllers/QuestionnaireController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { userId } = await validateKeycloakToken(req, res)
    const questionnaireId = req.query.id as string

    if (!questionnaireId) {
      return res.status(400).json({ error: "Missing questionnaire ID" })
    }

    const questionnaire =
      await questionnaireController.getOneByIdWithAccessCheck(
        questionnaireId,
        userId
      )

    return res.status(200).json({ questionnaire })
  } catch (error) {
    return res.status(403).json({ error: (error as Error).message })
  }
}
