// PENDING
import { NextApiRequest, NextApiResponse } from "next"
import OpenTaskController from "@/controllers/OpenTaskController"
import { validateKeycloakToken } from "@/utils/validateToken"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        const { userId } = await validateKeycloakToken(req)

        const data = await OpenTaskController.getAllMyOpenTaskActivity(userId)
        return res.status(200).json(data)
      } catch (err: any) {
        return res.status(500).json({ error: err.message })
      }
    default:
      res.setHeader("Allow", ["GET", "POST"])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
