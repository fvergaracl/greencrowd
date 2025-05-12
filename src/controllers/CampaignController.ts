import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"
import { Prisma } from "@prisma/client"

export default class CampaignControllerCommon {
  @withPrismaDisconnect
  static async getAllCampaigns() {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: {
          AND: [{ isDisabled: false }]
        },
        select: {
          id: true,
          name: true,
          areas: {
            where: { isDisabled: false },
            select: {
              id: true,
              name: true,
              pointOfInterests: {
                where: { isDisabled: false },
                select: {
                  id: true,
                  name: true,
                  tasks: {
                    where: { isDisabled: false },
                    select: {
                      id: true,
                      title: true,
                      description: true,
                      responseLimit: true,
                      responseLimitInterval: true,
                      availableFrom: true,
                      availableTo: true,
                      UserTaskResponses: {
                        where: { user: { sub: userId } },
                        select: { createdAt: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

      // Agregar lógica para calcular si puede responder
      return campaigns.map(campaign => ({
        ...campaign,
        areas: campaign.areas.map(area => ({
          ...area,
          pointOfInterests: area.pointOfInterests.map(poi => ({
            ...poi,
            tasks: poi.tasks.map(task => {
              const now = new Date()
              const lastResponse = task.UserTaskResponses.length
                ? new Date(
                    Math.max(
                      ...task.UserTaskResponses.map(response =>
                        new Date(response.createdAt).getTime()
                      )
                    )
                  )
                : null

              let canRespond = true
              let waitTime = null

              if (task.responseLimitInterval && lastResponse) {
                const nextAllowedResponseTime = new Date(
                  lastResponse.getTime() +
                    task.responseLimitInterval * 60 * 1000
                )
                canRespond = now >= nextAllowedResponseTime
                if (!canRespond) {
                  waitTime = Math.ceil(
                    (nextAllowedResponseTime.getTime() - now.getTime()) / 60000
                  ) // Tiempo en minutos
                }
              }

              return {
                ...task,
                canRespond,
                waitTime: waitTime ? `${waitTime} minutes` : null
              }
            })
          }))
        }))
      }))
    } catch (error) {
      throw new Error(`Failed to fetch campaigns: ${error.message}`)
    }
  }

  @withPrismaDisconnect
  static async getCampaignById(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        areas: {
          where: { isDisabled: false },
          include: {
            openTasks: {
              where: { isDisabled: false },
              include: {
                responses: {
                  select: {
                    latitude: true,
                    longitude: true
                  }
                }
              }
            },
            pointOfInterests: {
              where: { isDisabled: false },
              include: {
                tasks: {
                  where: { isDisabled: false }
                }
              }
            }
          }
        },
        allowedUsers: true
      }
    })

    if (!campaign) return null

    const now = new Date()

    const startsOk =
      !campaign.startDatetime || now >= new Date(campaign.startDatetime)
    const endsOk =
      !campaign.endDatetime || now <= new Date(campaign.endDatetime)

    const isOutsideDateRange = !startsOk || !endsOk

    return {
      ...campaign,
      isDisabled: isOutsideDateRange ? true : campaign.isDisabled
    }
  }

  @withPrismaDisconnect
  static async createCampaign(data: Prisma.CampaignCreateInput) {
    // Filtrar valores undefined
    const filteredData: Prisma.CampaignCreateInput = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value !== undefined ? value : null
      ])
    ) as Prisma.CampaignCreateInput

    return await prisma.campaign.create({
      data: filteredData
    })
  }

  @withPrismaDisconnect
  static async updateCampaign(id: string, data: Prisma.CampaignUpdateInput) {
    const filteredData: Prisma.CampaignUpdateInput = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value !== undefined ? value : null
      ])
    ) as Prisma.CampaignUpdateInput

    return await prisma.campaign.update({
      where: { id },
      data: filteredData
    })
  }

  @withPrismaDisconnect
  static async deleteCampaign(id: string) {
    return await prisma.campaign.delete({
      where: { id }
    })
  }

  @withPrismaDisconnect
  static async getAllCampaignsByUserId(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { sub: userId },
        select: { id: true }
      })

      if (!user) {
        throw new Error(`User with ID ${userId} not found.`)
      }

      return await prisma.campaign.findMany({
        where: {
          isDisabled: false,
          allowedUsers: {
            some: { userId: user.id }
          }
        },
        include: {
          areas: {
            where: { isDisabled: false },
            include: {
              pointOfInterests: {
                where: { isDisabled: false },
                include: {
                  tasks: {
                    where: { isDisabled: false },
                    select: { id: true }
                  }
                }
              }
            }
          },
          allowedUsers: true
        }
      })
    } catch (error) {
      console.error("Error fetching campaigns by user ID:", error)
      throw error
    }
  }

  @withPrismaDisconnect
  static async getAllCampaignsAllowedByUserId(userId: string) {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: {
          OR: [
            {
              AND: [
                { isDisabled: false },
                {
                  allowedUsers: {
                    some: { user: { sub: userId } }
                  }
                }
              ]
            },
            {
              AND: [
                { isDisabled: false },
                {
                  OR: [
                    { startDatetime: null, endDatetime: null },
                    { startDatetime: { lte: new Date() } },
                    { endDatetime: { gte: new Date() } }
                  ]
                }
              ]
            }
          ]
        },
        select: {
          id: true,
          name: true,
          gameId: true,
          startDatetime: true,
          endDatetime: true,
          areas: {
            where: { isDisabled: false },
            select: {
              id: true,
              name: true,
              polygon: true,
              pointOfInterests: {
                where: { isDisabled: false },
                select: {
                  id: true,
                  name: true,
                  tasks: {
                    where: { isDisabled: false },
                    select: {
                      id: true,
                      title: true,
                      description: true,
                      responseLimit: true,
                      responseLimitInterval: true,
                      availableFrom: true,
                      availableTo: true,
                      UserTaskResponses: {
                        where: { user: { sub: userId } },
                        select: { createdAt: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

      const now = new Date()

      const filteredCampaigns = campaigns.filter(campaign => {
        const { startDatetime, endDatetime } = campaign

        const startsOk = !startDatetime || now >= new Date(startDatetime)
        const endsOk = !endDatetime || now <= new Date(endDatetime)

        return startsOk && endsOk
      })

      return filteredCampaigns.map(campaign => ({
        ...campaign,
        areas: campaign.areas.map(area => ({
          ...area,
          pointOfInterests: area.pointOfInterests.map(poi => ({
            ...poi,
            tasks: poi.tasks.map(task => {
              const lastResponse = task.UserTaskResponses.length
                ? new Date(
                    Math.max(
                      ...task.UserTaskResponses.map(response =>
                        new Date(response.createdAt).getTime()
                      )
                    )
                  )
                : null

              let canRespond = true
              let waitTime: string | null = null

              // Ventana de disponibilidad de la tarea
              if (task.availableFrom && now < new Date(task.availableFrom)) {
                canRespond = false
                waitTime = "Not yet available"
              }

              if (task.availableTo && now > new Date(task.availableTo)) {
                canRespond = false
                waitTime = "Expired"
              }

              // Intervalo entre respuestas
              if (canRespond && task.responseLimitInterval && lastResponse) {
                const nextAllowedResponseTime = new Date(
                  lastResponse.getTime() +
                    task.responseLimitInterval * 60 * 1000
                )
                if (now < nextAllowedResponseTime) {
                  canRespond = false
                  waitTime = `${Math.ceil(
                    (nextAllowedResponseTime.getTime() - now.getTime()) / 60000
                  )} minutes`
                }
              }

              return {
                ...task,
                canRespond,
                waitTime
              }
            })
          }))
        }))
      }))
    } catch (error) {
      throw new Error(`Failed to fetch campaigns: ${error.message}`)
    }
  }

  @withPrismaDisconnect
  static async getCampaignNames() {
    return await prisma.campaign.findMany({
      where: { isDisabled: false },
      select: {
        id: true,
        name: true
      }
    })
  }

  @withPrismaDisconnect
  static async getMyActivityInCampaign(userId: string, campaignId: string) {
    const userTaskResponses = await prisma.userTaskResponse.findMany({
      where: {
        user: { sub: userId },
        task: { pointOfInterest: { area: { campaignId } } }
      },
      select: {
        createdAt: true,
        task: { select: { id: true, pointOfInterestId: true } }
      }
    })

    return userTaskResponses
  }
}
