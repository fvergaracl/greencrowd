import { NextApiRequest, NextApiResponse } from "next"
import { getAllLog, createLog } from "@/controllers/LogController"
import prisma from "@/prismaClient"
import { validateKeycloakToken } from "@/utils/validateToken"

const EVENTS_WITHOUT_AUTH = new Set([
  "ONBOARDING_STEP_CHANGED",
  "ONBOARDING_USER_LOGGED_IN",
  "ONBOARDING_SKIP_ON_STEP1",
  "ONBOARDING_SKIP_ON_STEP2",
  "ONBOARDING_SKIP_ON_STEP3",
  "ONBOARDING_SKIP_ON_STEP4",
  "ONBOARDING_SKIP_ON_STEP5",
  "ONBOARDING_SKIP_ON_STEP6",
  "ONBOARDING_SKIP_ON_STEP7",
  "ONBOARDING_LANGUAGE_CHANGED_ON_STEP1",
  "ONBOARDING_LANGUAGE_CHANGED_ON_STEP2",
  "ONBOARDING_LANGUAGE_CHANGED_ON_STEP3",
  "ONBOARDING_LANGUAGE_CHANGED_ON_STEP4",
  "ONBOARDING_LANGUAGE_CHANGED_ON_STEP5",
  "ONBOARDING_LANGUAGE_CHANGED_ON_STEP6",
  "ONBOARDING_LANGUAGE_CHANGED_ON_STEP7"
])

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET": {
      try {
        const { userId, userRoles } = await validateKeycloakToken(req, res)
        let user = await prisma.user.findUnique({
          where: { sub: userId }
        })
        if (!userRoles || !userRoles.includes("admin")) {
          return res.status(403).json({ error: "User not allowed" })
        }
        if (!user) {
          return res.status(403).json({ error: "User not allowed" })
        }
        const data = await getAllLog()
        return res.status(200).json(data)
      } catch (err: any) {
        return res.status(500).json({ error: err.message })
      }
    }
    case "POST": {
      try {
        const { eventType, description, metadata } = req.body

        if (!eventType) {
          return res.status(400).json({ error: "Missing eventType" })
        }

        let userId: string | null = null

        if (!EVENTS_WITHOUT_AUTH.has(eventType)) {
          const auth = await validateKeycloakToken(req, res)
          if (!auth?.userId) {
            return res.status(403).json({ error: "Unauthorized" })
          }

          const user = await prisma.user.findUnique({
            where: { sub: auth.userId },
            select: { id: true }
          })

          if (!user) {
            return res.status(403).json({ error: "User not found" })
          }

          userId = user.id
        }

        const logToInsert = { userId, eventType, description, metadata }
        const data = await createLog(logToInsert)

        return res.status(201).json(data)
      } catch (error) {
        console.error("Error processing request:", error)
        return res.status(500).json({ error: "Internal Server Error" })
      }
    }
    default:
      res.setHeader("Allow", ["GET", "POST"])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
