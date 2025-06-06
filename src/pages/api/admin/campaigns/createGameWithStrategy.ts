import type { NextApiRequest, NextApiResponse } from "next"
import CampaignController from "@/controllers/admin/CampaignController"
import { formatToISO } from "@/utils/dateTimeUtils"
import { isUUID } from "@/utils/isUUID"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { API_GAME_BASE_URL, API_GAME_APIKEY } = process.env
  try {
    switch (req.method) {
      case "POST": {
        let formattedStartDatetime = undefined
        if (req?.body?.startDatetime) {
          formattedStartDatetime = formatToISO(req.body.startDatetime)
        }
        let formattedEndDatetime = undefined
        if (req?.body?.endDatetime) {
          formattedEndDatetime = formatToISO(req.body.endDatetime)
        }
        const strategyId = req?.body?.selectedStrategyId
        if (!strategyId) {
          return res.status(400).json({ error: "Strategy ID is required" })
        }
        delete req?.body?.strategyId
        delete req?.body?.selectedStrategyId
        delete req?.body?.createWithGamification
        const newCampaignData = {
          ...req.body,
          startDatetime: formattedStartDatetime,
          endDatetime: formattedEndDatetime
        }

        const haveBothStartAndEndDatetime =
          formattedStartDatetime && formattedEndDatetime
        if (
          haveBothStartAndEndDatetime &&
          formattedStartDatetime > formattedEndDatetime
        ) {
          return res.status(400).json({
            error: "Start datetime cannot be greater than end datetime"
          })
        }
        if (req?.body?.gameId && !isUUID(req?.body?.gameId)) {
          return res.status(400).json({ error: "Invalid game ID" })
        }
        const newCampaign =
          await CampaignController.createCampaign(newCampaignData)

        if (newCampaignData) {
          const campaignId = newCampaign.id
          const formattedCampaign = `GREENCROWD_CAMPAIGNID_${campaignId}`
          const gameCreated = await fetch(`${API_GAME_BASE_URL}/games`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": API_GAME_APIKEY!
            },
            body: JSON.stringify({
              externalGameId: formattedCampaign,
              platform: "GREENCROWD",
              strategyId: strategyId,
              params: [
                {
                  key: "variable_basic_points",
                  value: 10
                }
              ]
            })
          })
          if (!gameCreated.ok) {
            const errorData = await gameCreated.json()
            return res.status(500).json({
              error: "Failed to create game",
              details: errorData
            })
          }

          const gameData = await gameCreated.json()
          const gameId = gameData.gameId
          await CampaignController.updateGameId(
            campaignId as string,
            gameId as string
          )
          newCampaign.gameId = gameId
        }
        return res.status(201).json(newCampaign)
      }

      default: {
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
        return res
          .status(405)
          .json({ error: `Method ${req.method} Not Allowed` })
      }
    }
  } catch (error) {
    console.error("API Error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
