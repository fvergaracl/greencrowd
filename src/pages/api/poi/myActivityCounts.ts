import { NextApiRequest, NextApiResponse } from "next"
import PointOfInterestController from "@/controllers/PointOfInterestController"
import { validateKeycloakToken } from "@/utils/validateToken" // Token validator

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { userId } = await validateKeycloakToken(req)
    const poiId = req.query.poiId as string

    const user = await prisma.user.findUnique({
      where: {
        sub: userId
      },
      select: { id: true }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const response = await PointOfInterestController.getMyActivityInPOI(
      userId,
      poiId
    )

    return res.status(200).json(response)
  } catch (error) {
    console.error("Error fetching user campaigns:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
