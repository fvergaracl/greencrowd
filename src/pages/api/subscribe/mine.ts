import type { NextApiRequest, NextApiResponse } from "next"
import webpush from "web-push"
import { validateKeycloakToken } from "@/utils/validateToken"
import PushSubscriptionController from "@/controllers/PushSubscriptionController"

// Configura las claves VAPID
webpush.setVapidDetails(
  "mailto:tu@email.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        const { userId } = await validateKeycloakToken(req, res)
        const result = await PushSubscriptionController.findByUser(userId)
        return res.status(200).json(result)
      } catch (err: any) {
        console.error("❌ Error in subscription:", err)
        return res.status(400).json({ error: err.message || "Internal error" })
      }

    default:
      res.setHeader("Allow", ["GET"])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
