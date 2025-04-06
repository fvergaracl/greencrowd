import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect";
import { Prisma } from "@prisma/client";

export default class TaskController {
  @withPrismaDisconnect
  static async getAllTasks() {
    try {
      const response = await prisma.task.findMany({
        where: { isDisabled: false },
        include: {
          pointOfInterest: {
            where: { isDisabled: false },
            include: {
              area: {
                where: { isDisabled: false },
                include: {
                  campaign: {
                    where: { isDisabled: false },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw new Error("Failed to fetch tasks");
    }
  }

  @withPrismaDisconnect
  static async getAllMyActivity(userSub: string) {
    try {
      if (!userSub) {
        throw new Error("User sub is required");
      }

      const user = await prisma.user.findUnique({
        where: { sub: userSub },
        select: { id: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const campaigns = await prisma.campaign.findMany({
        where: {
          OR: [
            { isDisabled: false },
            {
              areas: {
                some: {
                  pointOfInterests: {
                    some: {
                      tasks: {
                        some: {
                          UserTaskResponses: {
                            some: {
                              userId: user.id,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          isDisabled: true,
          areas: {
            where: {
              OR: [
                { isDisabled: false },
                {
                  pointOfInterests: {
                    some: {
                      tasks: {
                        some: {
                          UserTaskResponses: {
                            some: {
                              userId: user.id,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
            select: {
              name: true,
              description: true,
              isDisabled: true,
              pointOfInterests: {
                where: {
                  OR: [
                    { isDisabled: false },
                    {
                      tasks: {
                        some: {
                          UserTaskResponses: {
                            some: {
                              userId: user.id,
                            },
                          },
                        },
                      },
                    },
                  ],
                },
                select: {
                  name: true,
                  description: true,
                  isDisabled: true,
                  tasks: {
                    where: {
                      OR: [
                        { isDisabled: false },
                        {
                          UserTaskResponses: {
                            some: {
                              userId: user.id,
                            },
                          },
                        },
                      ],
                    },
                    select: {
                      id: true,
                      title: true,
                      description: true,
                      taskData: true,
                      isDisabled: true,
                      UserTaskResponses: {
                        where: { userId: user.id },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return campaigns;
    } catch (error) {
      console.error("Error fetching activity by campaign:", error);
      throw new Error("Failed to fetch tasks grouped by campaign");
    } finally {
      await prisma.$disconnect();
    }
  }

  @withPrismaDisconnect
  static async getTaskById(id: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          UserTaskResponses: true,
          pointOfInterest: {
            include: {
              area: {
                include: {
                  campaign: true,
                },
              },
            },
          },
        },
      });

      if (
        !task ||
        task?.isDisabled ||
        task?.pointOfInterest?.isDisabled ||
        task?.pointOfInterest?.area?.isDisabled ||
        task?.pointOfInterest?.area?.campaign?.isDisabled
      ) {
        return null;
      }

      return task;
    } catch (error) {
      console.error("Error fetching task by ID:", error);
      throw new Error("Failed to fetch task");
    }
  }

  @withPrismaDisconnect
  static async getTaskByIdDetails(id: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          UserTaskResponses: true,
          pointOfInterest: {
            include: {
              area: {
                include: {
                  campaign: true,
                },
              },
            },
          },
        },
      });

      if (!task) return null;

      const isDisabled =
        task.isDisabled ||
        task.pointOfInterest?.isDisabled ||
        task.pointOfInterest?.area?.isDisabled ||
        task.pointOfInterest?.area?.campaign?.isDisabled;

      const hasUserResponses = task.UserTaskResponses.length > 0;

      if (isDisabled && !hasUserResponses) {
        return null;
      }

      return task;
    } catch (error) {
      console.error("Error fetching task by ID:", error);
      throw new Error("Failed to fetch task");
    }
  }

  @withPrismaDisconnect
  static async getTaskResponseById(taskId: string, responseId: string) {
    try {
      if (!taskId || !responseId) {
        throw new Error("Both taskId and responseId are required");
      }

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          pointOfInterest: {
            include: {
              area: {
                include: {
                  campaign: true,
                },
              },
            },
          },
        },
      });

      if (
        !task ||
        task.isDisabled ||
        task.pointOfInterest?.isDisabled ||
        task.pointOfInterest?.area?.isDisabled ||
        task.pointOfInterest?.area?.campaign?.isDisabled
      ) {
        return null;
      }

      const response = await prisma.userTaskResponse.findFirst({
        where: {
          id: responseId,
          taskId: taskId,
        },
      });

      if (!response) {
        return null;
      }

      return {
        task,
        response,
      };
    } catch (error) {
      console.error("Error fetching response by ID:", error);
      throw new Error("Failed to fetch response");
    }
  }

  @withPrismaDisconnect
  static async getTaskByIdEvenDisabled(id: string) {
    try {
      if (!id) {
        throw new Error("ID is required to fetch a task.");
      }

      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          pointOfInterest: {
            include: {
              area: {
                include: {
                  campaign: true,
                },
              },
            },
          },
        },
      });

      return task;
    } catch (error) {
      console.error("Error fetching task by ID:", error);
      throw new Error("Failed to fetch task");
    }
  }

  @withPrismaDisconnect
  static async updateTask(data: Prisma.TaskCreateInput) {
    try {
      return await prisma.task.update({
        where: { id: data.id },
        data,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      throw new Error("Failed to update task");
    }
  }

  @withPrismaDisconnect
  static async deleteTask(id: string) {
    try {
      return await prisma.task.update({
        where: { id },
        data: { isDisabled: true },
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task");
    }
  }

  @withPrismaDisconnect
  static async getMyActivityInTask(userId: string, taskId: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          pointOfInterest: {
            include: {
              area: {
                include: {
                  campaign: true,
                },
              },
            },
          },
        },
      });

      if (
        !task ||
        task.isDisabled ||
        task.pointOfInterest?.isDisabled ||
        task.pointOfInterest?.area?.isDisabled ||
        task.pointOfInterest?.area?.campaign?.isDisabled
      ) {
        return [];
      }

      const userTaskResponses = await prisma.userTaskResponse.findMany({
        where: {
          userId,
          taskId,
        },
        select: {
          createdAt: true,
        },
      });

      return userTaskResponses;
    } catch (error) {
      console.error("Error fetching user activity in task:", error);
      throw new Error("Failed to fetch user activity in task");
    }
  }
}
