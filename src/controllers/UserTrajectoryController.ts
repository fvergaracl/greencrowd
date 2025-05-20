import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"
export default class UserTrajectoryController {
  @withPrismaDisconnect
  static async createNewTrajectory(data: any) {
    const response = prisma.userTrajectory.create({ data })
    return response
  }
}
