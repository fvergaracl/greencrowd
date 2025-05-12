import { NextApiRequest, NextApiResponse } from "next"
import OpenTaskController from "@/controllers/admin/OpenTasksController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as {
    id: string
  }
  try {
    switch (req.method) {
      case "GET": {
        try {
          const tasks = await OpenTaskController.getAllOpenTasks()
          return res.status(200).json(tasks)
        } catch (error) {
          console.error("Error fetching open tasks:", error)
          return res.status(500).json({ error: "Internal Server Error" })
        }
      }

      case "POST": {
        try {
          const areaId = id
          const newTaskBody = {
            title: req.body.title,
            description: req.body.description,
            type: req.body.type,
            taskData: req.body.taskData,
            areaId,
            allowedRadius: Number(req.body.allowedRadius) || 50,
            availableFrom: req.body.availableFrom
              ? new Date(req.body.availableFrom).toISOString()
              : undefined,
            availableTo: req.body.availableTo
              ? new Date(req.body.availableTo).toISOString()
              : undefined
          }

          if (!newTaskBody.areaId) {
            return res.status(400).json({ error: "areaId is required" })
          }

          if (newTaskBody?.allowedRadius && isNaN(newTaskBody?.allowedRadius)) {
            return res
              .status(400)
              .json({ error: "Allowed radius must be a number" })
          }

          if (newTaskBody?.availableFrom) {
            if (isNaN(Date.parse(newTaskBody?.availableFrom)))
              return res
                .status(400)
                .json({ error: "Available from should be a valid date" })

            newTaskBody.availableFrom = new Date(
              newTaskBody.availableFrom
            ).toISOString()
          }

          if (newTaskBody?.availableTo) {
            if (isNaN(Date.parse(newTaskBody?.availableTo)))
              return res
                .status(400)
                .json({ error: "Available to should be a valid date" })

            newTaskBody.availableTo = new Date(
              newTaskBody.availableTo
            ).toISOString()
          }

          if (
            newTaskBody.availableFrom &&
            newTaskBody.availableTo &&
            newTaskBody.availableFrom > newTaskBody.availableTo
          ) {
            return res.status(400).json({
              error: "Available from date should be before available to date"
            })
          }

          const newTask = await OpenTaskController.createOpenTask(newTaskBody)
          return res.status(201).json(newTask)
        } catch (error) {
          console.error("Error creating open task:", error)
          return res.status(500).json({ error: "Internal Server Error" })
        }
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
      }
    }
  } catch (error) {
    console.error("API Error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
