import { NextApiRequest, NextApiResponse } from "next"
import QuestionnaireController from "@/controllers/admin/QuestionnaireController"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  try {
    switch (req.method) {
      case "GET": {
        if (!id) {
          return res.status(400).json({ error: "Questionnaire ID is required" })
        }

        const questionnaire = await QuestionnaireController.getQuestionnaireById(id as string)
        return res.status(200).json(questionnaire)
      }

      case "PUT": {
        if (!id) {
          return res.status(400).json({ error: "Questionnaire ID is required" })
        }
        const updatedQuestionnaireBody = {
          title: req?.body?.title,
          condition: req?.body?.condition,
          frequencyInDays: req?.body?.frequencyInDays,
          questionnaireData: req?.body?.questionnaireData
        }

        if (!updatedQuestionnaireBody.title) {
          return res.status(400).json({ error: "Title is required" })
        }
        if (!updatedQuestionnaireBody.condition) {
          return res.status(400).json({ error: "Condition is required" })
        }
        if (
          updatedQuestionnaireBody.condition === "EVERY_X_DAYS" &&
          (updatedQuestionnaireBody.frequencyInDays === undefined ||
            updatedQuestionnaireBody.frequencyInDays === null)
        ) {
          return res.status(400).json({
            error: "Frequency in days is required for EVERY_X_DAYS condition"
          })
        }

        const questionnaire = await QuestionnaireController.updateQuestionnaire(
          id as string,
          updatedQuestionnaireBody
        )

       
        return res.status(200).json(questionnaire)
      }

      case "DELETE": {
        if (!id) {
          return res.status(400).json({ error: "Task ID is required" })
        }

        await prisma.task.delete({ where: { id: id as string } })
        return res.status(204).end()
      }

      default:
        return res.status(405).end()
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
