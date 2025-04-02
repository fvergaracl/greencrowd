import { NextApiRequest, NextApiResponse } from "next"
import CampaignController from "@/controllers/CampaignController"
import { validateKeycloakToken } from "@/utils/validateToken" // Token validator
import { prisma } from "@/utils/withPrismaDisconnect"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { userId } = await validateKeycloakToken(req)
    const campaignId = req.query.campaignId as string

    const user = await prisma.user.findUnique({
      where: {
        sub: userId
      },
      select: { id: true }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const response = await CampaignController.getMyActivityInCampaign(
      userId,
      campaignId
    )

    return res.status(200).json(response)
  } catch (error) {
    console.error("Error fetching user campaigns:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
