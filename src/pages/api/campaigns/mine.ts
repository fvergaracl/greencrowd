import { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/prismaClient" 
import { validateKeycloakToken } from "@/utils/validateToken" 

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { userId } = await validateKeycloakToken(req, res)

    const user = await prisma.user.findUnique({
      where: {
        sub: userId
      },
      select: { id: true }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const userAccess = await prisma.userCampaignAccess.findMany({
      where: {
        userId: user.id,
        campaign: {
          isDisabled: false
        }
      },
      select: {
        campaignId: true
      }
    })

    return res.status(200).json(userAccess)
  } catch (error) {
    console.error("Error fetching user campaigns:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
