import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"
import { Prisma } from "@prisma/client"

export default class CampaignController {
  @withPrismaDisconnect
  static async getAllCampaigns() {
    const campaigns = await prisma.campaign.findMany({
      where: { isDisabled: false },
      include: {
        areas: {
          include: {
            pointOfInterests: {
              include: {
                tasks: {
                  select: { id: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            Questionnaire: true
          }
        },
        allowedUsers: {
          include: {
            user: {
              select: { id: true, sub: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return campaigns.map(c => ({
      ...c,
      questionnaires: c._count.Questionnaire,
      _count: undefined
    }))
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
  static async getCampaignNamesWithPolygons() {
    return await prisma.campaign.findMany({
      where: { isDisabled: false },
      select: {
        id: true,
        name: true,
        areas: {
          where: { isDisabled: false },
          select: {
            polygon: true,
            name: true
          }
        }
      }
    })
  }

  @withPrismaDisconnect
  static async getCampaignById(id: string) {
    return await prisma.campaign.findUnique({
      where: { id, isDisabled: false },
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
        Questionnaire: true,
        allowedUsers: true
      }
    })
  }

  @withPrismaDisconnect
  static async createCampaign(data: Prisma.CampaignCreateInput) {
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
  static async updateCampaign(id: string, data: any) {
    const filteredData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value !== undefined ? value : null
      ])
    )

    return await prisma.campaign.update({
      where: { id },
      data: filteredData
    })
  }

  @withPrismaDisconnect
  static async deleteCampaign(id: string) {
    // change all campaing , areas, pois , task related with this campaign to isDisabled = true
    const campaign = await prisma.campaign.update({
      where: { id },
      data: { isDisabled: true }
    })

    const areas = await prisma.area.updateMany({
      where: { campaignId: id },
      data: { isDisabled: true }
    })

    const pois = await prisma.pointOfInterest.updateMany({
      where: { area: { campaignId: id } },
      data: { isDisabled: true }
    })

    const tasks = await prisma.task.updateMany({
      where: { pointOfInterest: { area: { campaignId: id } } },
      data: { isDisabled: true }
    })

    return { campaign, areas, pois, tasks }
  }

  @withPrismaDisconnect
static async getAllGroupNames() {
  const groups = await prisma.campaign.findMany({
    where: {
      isDisabled: false,
      groupName: { not: null }
    },
    distinct: ["groupName"],
    select: {
      groupName: true
    }
  })

  return groups
    .map(g => g.groupName)
    .filter((name): name is string => !!name)
}

}
