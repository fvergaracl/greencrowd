import { prisma, withPrismaDisconnect } from "@/utils/withPrismaDisconnect"
export default class UserTrajectoryController {
  @withPrismaDisconnect
  static async createNewTrajectory(data: any) {
    console.log("------------------ data ----------------")
    console.log(data)
    console.time("DB Insert")
    const response = prisma.userTrajectory.create({ data })
    console.timeEnd("DB Insert")
    return response
  }
}
