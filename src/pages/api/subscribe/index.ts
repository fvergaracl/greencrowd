import type { NextApiRequest, NextApiResponse } from "next"
import webpush from "web-push"
import { validateKeycloakToken } from "@/utils/validateToken"
import PushSubscriptionController from "@/controllers/PushSubscriptionController"

// Configura las claves VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      try {
        const { userId, userRoles } = await validateKeycloakToken(req, res)
        if (!userRoles || !userRoles.includes("admin")) {
          return res.status(403).json({ error: "User not allowed" })
        }

        const result = await PushSubscriptionController.save(userId, req.body)
        webpush.sendNotification(req.body, "Notification from GreenCrowd")
        return res.status(201).json({
          message: "Notification subscription saved successfully",
          id: result.id
        })
      } catch (err: any) {
        console.error("❌ Error in subscription:", err)
        return res.status(400).json({ error: err.message || "Internal error" })
      }
    case "GET":
      try {
        const { userRoles } = await validateKeycloakToken(req, res)
        if (!userRoles || !userRoles.includes("admin")) {
          return res.status(403).json({ error: "User not allowed" })
        }
        const result = await PushSubscriptionController.findAllNotifications()
        return res.status(200).json(result)
      } catch (err: any) {
        console.error("❌ Error in subscription:", err)
        return res.status(400).json({ error: err.message || "Internal error" })
      }

    default:
      res.setHeader("Allow", ["POST", "GET"])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
