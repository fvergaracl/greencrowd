import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"

export default class OpenTaskController {
  @withPrismaDisconnect
  static async getAllOpenTasks() {
    try {
      const response = await prisma.openTask.findMany({
        where: { isDisabled: false },
        include: {
          area: {
            where: { isDisabled: false },
            include: {
              campaign: {
                where: { isDisabled: false }
              }
            }
          }
        }
      })
      return response
    } catch (error) {
      console.error("Error fetching open tasks:", error)
      throw new Error("Failed to fetch open tasks")
    }
  }

  @withPrismaDisconnect
  static async getAllMyOpenTaskActivity(userSub: string) {
    try {
      if (!userSub) {
        throw new Error("User sub is required")
      }

      const user = await prisma.user.findUnique({
        where: { sub: userSub },
        select: { id: true }
      })

      if (!user) {
        throw new Error("User not found")
      }

      const campaigns = await prisma.campaign.findMany({
        where: {
          isDisabled: false,
          areas: {
            some: {
              isDisabled: false,
              openTasks: {
                some: {
                  responses: {
                    some: {
                      userId: user.id
                    }
                  }
                }
              }
            }
          }
        },
        select: {
          id: true,
          name: true,
          description: true,
          isDisabled: true,
          areas: {
            where: {
              isDisabled: false,
              openTasks: {
                some: {
                  responses: {
                    some: {
                      userId: user.id
                    }
                  }
                }
              }
            },
            select: {
              id: true,
              name: true,
              description: true,
              isDisabled: true,
              openTasks: {
                where: {
                  OR: [
                    { isDisabled: false },
                    {
                      responses: {
                        some: {
                          userId: user.id
                        }
                      }
                    }
                  ]
                },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  taskData: true,
                  isDisabled: true,
                  availableFrom: true,
                  availableTo: true,
                  responses: {
                    where: { userId: user.id },
                    select: {
                      id: true,
                      data: true,
                      createdAt: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      return campaigns
    } catch (error) {
      console.error("Error fetching activity by campaign:", error)
      throw new Error("Failed to fetch open tasks grouped by campaign")
    } finally {
      await prisma.$disconnect()
    }
  }

  @withPrismaDisconnect
  static async getOpenTaskById(id: string) {
    try {
      const openTask = await prisma.openTask.findUnique({
        where: { id },
        include: {
          responses: true,
          area: {
            include: {
              campaign: true
            }
          }
        }
      })

      if (
        !openTask ||
        openTask.isDisabled ||
        openTask.area?.isDisabled ||
        openTask.area?.campaign?.isDisabled
      ) {
        return null
      }

      return openTask
    } catch (error) {
      console.error("Error fetching open task by ID:", error)
      throw new Error("Failed to fetch open task")
    }
  }

  @withPrismaDisconnect
  static async getOpenTaskByIdDetails(id: string) {
    try {
      const openTask = await prisma.openTask.findUnique({
        where: { id },
        include: {
          responses: true,
          area: {
            include: {
              campaign: true
            }
          }
        }
      })

      if (!openTask) return null

      const isDisabled =
        openTask.isDisabled ||
        openTask.area?.isDisabled ||
        openTask.area?.campaign?.isDisabled

      const hasUserResponses = openTask.responses.length > 0

      if (isDisabled && !hasUserResponses) {
        return null
      }

      return openTask
    } catch (error) {
      console.error("Error fetching open task by ID:", error)
      throw new Error("Failed to fetch open task")
    }
  }

  @withPrismaDisconnect
  static async getOpenTaskResponseById(openTaskId: string, responseId: string) {
    try {
      if (!openTaskId || !responseId) {
        throw new Error("Both openTaskId and responseId are required")
      }

      const openTask = await prisma.openTask.findUnique({
        where: { id: openTaskId },
        include: {
          area: {
            include: {
              campaign: true
            }
          }
        }
      })

      if (
        !openTask ||
        openTask.isDisabled ||
        openTask.area?.isDisabled ||
        openTask.area?.campaign?.isDisabled
      ) {
        return null
      }

      const response = await prisma.openTaskResponse.findFirst({
        where: {
          id: responseId,
          openTaskId: openTaskId
        }
      })

      if (!response) {
        return null
      }

      return {
        task: openTask,
        response
      }
    } catch (error) {
      console.error("Error fetching open task response by ID:", error)
      throw new Error("Failed to fetch response")
    }
  }

  @withPrismaDisconnect
  static async getOpenTaskByIdEvenDisabled(id: string) {
    try {
      if (!id) {
        throw new Error("ID is required to fetch an open task.")
      }

      const openTask = await prisma.openTask.findUnique({
        where: { id },
        include: {
          area: {
            include: {
              campaign: true
            }
          }
        }
      })

      return openTask
    } catch (error) {
      console.error("Error fetching open task by ID:", error)
      throw new Error("Failed to fetch open task")
    }
  }

  @withPrismaDisconnect
  static async getMyActivityInOpenTask(userId: string, openTaskId: string) {
    try {
      const task = await prisma.openTask.findUnique({
        where: { id: openTaskId },
        include: {
          area: {
            include: {
              campaign: true
            }
          }
        }
      })

      if (
        !task ||
        task.isDisabled ||
        task.area?.isDisabled ||
        task.area?.campaign?.isDisabled
      ) {
        return []
      }

      const userResponses = await prisma.openTaskResponse.findMany({
        where: {
          userId,
          openTaskId
        },
        select: {
          createdAt: true
        }
      })

      return userResponses
    } catch (error) {
      console.error("Error fetching user activity in open task:", error)
      throw new Error("Failed to fetch user activity in open task")
    }
  }
}
