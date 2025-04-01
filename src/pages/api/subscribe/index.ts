import type { NextApiRequest, NextApiResponse } from "next"
import webpush from "web-push"
import { validateKeycloakToken } from "@/utils/validateToken"
import { prisma } from "@/utils/withPrismaDisconnect"

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL!}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { userId, userRoles } = await validateKeycloakToken(req, res)

    if (!userRoles || !userRoles.includes("admin")) {
      return res.status(403).json({ error: "User not allowed" })
    }

    const { title, body, url } = req.body

    if (!title || !body) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Obtener todas las suscripciones
    const subscriptions = await prisma.pushSubscription.findMany()

    const results = await Promise.allSettled(
      subscriptions.map(async sub => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys as any
            },
            JSON.stringify({ title, body, url })
          )
          return { endpoint: sub.endpoint, success: true }
        } catch (err: any) {
          console.error("❌ Error con", sub.endpoint, err.statusCode)

          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { endpoint: sub.endpoint }
            })
          }

          return { endpoint: sub.endpoint, success: false, error: err.message }
        }
      })
    )

    return res.status(200).json({ message: "Notificaciones enviadas", results })
  } catch (err: any) {
    console.error("❌ Error al enviar notificaciones:", err)
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" })
  }
}
