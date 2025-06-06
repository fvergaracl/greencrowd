import { NextApiRequest, NextApiResponse } from "next"
import CampaignController from "@/controllers/admin/CampaignController"

const checkGameId = async (formattedCampaign: string) => {
  const { API_GAME_BASE_URL, API_GAME_APIKEY } = process.env
  const response = await fetch(
    `${API_GAME_BASE_URL}/games?externalGameId=${formattedCampaign}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_GAME_APIKEY!
      }
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch game ID")
  }

  const data = await response.json()
  return data.items.length > 0 ? data.items[0].gameId : null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { campaignId } = req.query

  const formattedCampaign = `GREENCROWD_CAMPAIGNID_${campaignId}`
  try {
    switch (req.method) {
      case "GET": {
        if (!campaignId) {
          return res.status(400).json({ error: "Campaign ID is required" })
        }

        const campaign = await CampaignController.getCampaignById(
          campaignId as string
        )

        if (!campaign) {
          return res.status(404).json({ error: "Campaign not found" })
        }
        const gameId = await checkGameId(formattedCampaign as string)
        if (!gameId) {
          return res.status(404).json({ error: "Game not found" })
        }
        return res.status(200).json({
          gameId
        })
      }

      case "POST": {
        const {strategyId} = req.body
        if (!strategyId) {
          return res.status(400).json({ error: "Strategy ID is required" })
        }
        if (!campaignId) {
          return res.status(400).json({ error: "Campaign ID is required" })
        }

        const campaign = await CampaignController.getCampaignById(
          campaignId as string
        )

        if (!campaign) {
          return res.status(404).json({ error: "Campaign not found" })
        }
        let gameId = await checkGameId(campaignId as string)
        if (gameId) {
          return res.status(200).json({
            gameId
          })
        }

        const gameCreated = await fetch(
          `${process.env.API_GAME_BASE_URL}/games`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": process.env.API_GAME_APIKEY!
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
          }
        )
        if (!gameCreated.ok) {
          const errorData = await gameCreated.json()
          return res.status(500).json({
            error: "Failed to create game",
            details: errorData
          })
        }

        const gameData = await gameCreated.json()
        gameId = gameData.gameId
        await CampaignController.updateGameId(
          campaignId as string,
          gameId as string
        )

        return res.status(201).json({
          gameId: gameId,
          message: `Game with gameId: ${gameId} created successfully`
        })
      }
      case "DELETE": {
        if (!campaignId) {
          return res.status(400).json({ error: "Campaign ID is required" })
        }

        const campaign = await CampaignController.getCampaignById(
          campaignId as string
        )

        if (!campaign) {
          return res.status(404).json({ error: "Campaign not found" })
        }
        let gameId = await checkGameId(campaignId as string)
        if (gameId) {
          return res.status(200).json({
            gameId
          })
        }
        await CampaignController.updateGameId(campaignId as string, "")

        return res.status(204).json({
          message: `Game with gameId: ${gameId} deleted successfully`
        })
      }

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("API Error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
