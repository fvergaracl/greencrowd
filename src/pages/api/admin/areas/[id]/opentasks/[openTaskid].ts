import { NextApiRequest, NextApiResponse } from "next"
import OpenTaskController from "@/controllers/admin/OpenTasksController"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as {
    id: string
  }
  const { openTaskid } = req.query as {
    openTaskid: string
  }

  try {
    switch (req.method) {
      case "GET": {
        if (!id) {
          return res.status(400).json({ error: "OpenTask ID is required" })
        }

        const task = await OpenTaskController.getOpenTaskById(
          openTaskid as string
        )
        return res.status(200).json(task)
      }
      case "POST": {
        try {
          const areaId = id
          const newTaskBody = {
            ...req.body,
            areaId
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
      case "PUT": {
        if (!openTaskid) {
          return res.status(400).json({ error: "OpenTask ID is required" })
        }

        const updatedTaskBody = {
          title: req.body?.title,
          description: req.body?.description,
          type: req.body?.type,
          taskData: req.body?.taskData,
          areaId: req.body?.areaId,
          allowedRadius: req.body?.allowedRadius,
          availableFrom: req.body?.availableFrom,
          availableTo: req.body?.availableTo
        }

        if (
          updatedTaskBody?.availableFrom &&
          isNaN(Date.parse(updatedTaskBody.availableFrom))
        ) {
          return res
            .status(400)
            .json({ error: "Available from should be a valid date" })
        }

        if (
          updatedTaskBody?.availableTo &&
          isNaN(Date.parse(updatedTaskBody.availableTo))
        ) {
          return res
            .status(400)
            .json({ error: "Available to should be a valid date" })
        }

        if (
          updatedTaskBody?.availableFrom &&
          updatedTaskBody?.availableTo &&
          new Date(updatedTaskBody.availableFrom) >
            new Date(updatedTaskBody.availableTo)
        ) {
          return res.status(400).json({
            error: "Available from date should be before available to date"
          })
        }

        const task = await OpenTaskController.updateOpenTask(
          openTaskid as string,
          updatedTaskBody
        )
        return res.status(200).json(task)
      }

      case "DELETE": {
        if (!id) {
          return res.status(400).json({ error: "OpenTask ID is required" })
        }

        await prisma.openTask.delete({ where: { id: id as string } })
        return res.status(204).end()
      }

      default:
        return res.status(405).json({ error: "Method Not Allowed" })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
