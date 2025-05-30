import { NextApiRequest, NextApiResponse } from "next"
import QuestionnaireResponseController from "@/controllers/admin/QuestionnaireResponseController"
import UserController from "@/controllers/UserController"
import { validateKeycloakToken } from "@/utils/validateToken" // Token validator

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "POST": {
        try {
          const { userId } = await validateKeycloakToken(req, res)
          if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
          }

          let user = await UserController.getUserBySub(userId)
          if (!user) {
            return res.status(404).json({ error: "User not found" })
          }
          const { questionnaireId, questionnaireResponse } = req.body

          if (!questionnaireId || !questionnaireResponse) {
            return res.status(400).json({
              error: "questionnaireId and questionnaireResponse are required"
            })
          }

          const response =
            await QuestionnaireResponseController.createNewResponse({
              userId: user?.id,
              questionnaireId,
              questionnaireResponse
            })

          return res.status(201).json(response)
        } catch (error) {
          console.error("Error creating QuestionnaireResponse:", error)
          return res.status(500).json({ error: "Internal Server Error" })
        }
      }

      default: {
        res.setHeader("Allow", ["POST"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
      }
    }
  } catch (error) {
    console.error("API Error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
