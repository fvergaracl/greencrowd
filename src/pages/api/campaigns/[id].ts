import { NextApiRequest, NextApiResponse } from "next"
import CampaignController from "../../../controllers/CampaignController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        const { id } = req.query
        const data = await CampaignController.getCampaignById(String(id))

        if (!data) {
          res.status(404).json({ error: "Campaign not found" })
        } else {
          res.status(200).json(data)
        }
      } catch (err: any) {
        res.status(500).json({ error: err.message })
      }
      break
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
