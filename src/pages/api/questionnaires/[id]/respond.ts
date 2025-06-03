import type { NextApiRequest, NextApiResponse } from "next"
import { validateKeycloakToken } from "@/utils/validateToken"
import QuestionnaireResponsesController from "@/controllers/QuestionnaireResponsesController"

interface QuestionnaireResponseRequestBody {
  questionnaireResponse: Record<string, any>
  questionnaireData?: Record<string, any>
}

interface SaveResponseResult {
  responseId: string
  createdAt: Date
}

type ApiResponse =
  | { success: true; data: SaveResponseResult }
  | { success: false; error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed. Use POST." })
  }

  try {
    const { userId } = await validateKeycloakToken(req, res)

    const questionnaireId = req.query.id
    if (typeof questionnaireId !== "string") {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid questionnaire ID"
      })
    }

    const body = req.body as QuestionnaireResponseRequestBody

    if (
      !body.questionnaireResponse ||
      typeof body.questionnaireResponse !== "object"
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing questionnaireResponse in request body"
      })
    }

    const result = await QuestionnaireResponsesController.saveResponse({
      questionnaireId,
      userSub: userId,
      questionnaireResponse: body.questionnaireResponse,
      questionnaireData: body.questionnaireData
    })

    return res.status(201).json({ success: true, data: result })
  } catch (error: any) {
    console.error("Error saving questionnaire response:", error)
    return res.status(403).json({
      success: false,
      error: error.message || "Unknown error occurred"
    })
  }
}
