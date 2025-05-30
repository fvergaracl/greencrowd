import { NextApiRequest, NextApiResponse } from "next"
import QuestionnaireController from "@/controllers/admin/QuestionnaireController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        try {
          const questionnaires =
            await QuestionnaireController.getAllQuestionnaires()
          return res.status(200).json(questionnaires)
        } catch (error) {
          console.error("Error fetching questionnaires:", error)
          return res.status(500).json({ error: "Internal Server Error" })
        }
      }

      case "POST": {
        try {
          const newQuestionnaireData = req.body

          if (!newQuestionnaireData.title) {
            return res.status(400).json({ error: "Title is required" })
          }

          if (!newQuestionnaireData.condition) {
            return res.status(400).json({ error: "Condition is required" })
          }

          if (
            newQuestionnaireData.condition === "EVERY_X_DAYS" &&
            (newQuestionnaireData.frequencyInDays === undefined ||
              newQuestionnaireData.frequencyInDays === null)
          ) {
            return res.status(400).json({
              error: "Frequency in days is required for EVERY_X_DAYS condition"
            })
          }

          const newQuestionnaire =
            await QuestionnaireController.createQuestionnaire(
              newQuestionnaireData
            )

          return res.status(201).json(newQuestionnaire)
        } catch (error) {
          console.error("Error creating newQuestionnaire:", error)
          return res.status(500).json({ error: "Internal Server Error" })
        }
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
      }
    }
  } catch (error) {
    console.error("API Error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
