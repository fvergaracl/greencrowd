import { NextApiRequest, NextApiResponse } from "next"
import UserTrajectoryController from "@/controllers/UserTrajectoryController"
import { validateKeycloakToken } from "@/utils/validateToken" // Token validator
import { getCookies } from "@/utils/cookies"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "POST": {
        const {
          lat,
          lng,
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          speed
        } = req.body
        const { userId } = await validateKeycloakToken(req)
        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" })
        }
        const cookies = getCookies(req)
        const token = cookies.access_token
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString("utf-8")
        )
        const userSub = payload.sub
        const trajectory = {
          userSub,
          latitude: lat,
          longitude: lng,
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          speed
        }
        const createdCampaign =
          await UserTrajectoryController.createNewTrajectory(trajectory)
        console.timeEnd("DBInsert")
        return res.status(201).json(createdCampaign)
      }

      default:
        res.setHeader("Allow", ["POST"])
        return res
          .status(405)
          .end(`Method ${req.method} is not allowed on this endpoint.`)
    }
  } catch (err: any) {
    console.error("API Error:", err.message)
    return res.status(500).json({ error: err.message })
  }
}
