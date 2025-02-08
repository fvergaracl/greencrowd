import { NextApiRequest, NextApiResponse } from "next";
import { getAllLog, createLog } from "@/controllers/LogController";
import prisma from "@/prismaClient";
import { validateKeycloakToken } from "@/utils/validateToken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET": {
      try {
        const { userId, userRoles } = await validateKeycloakToken(req, res);
        let user = await prisma.user.findUnique({
          where: { sub: userId },
        });
        console.log({ userId, userRoles });
        if (!userRoles || !userRoles.includes("admin")) {
          return res.status(403).json({ error: "User not allowed" });
        }
        if (!user) {
          return res.status(403).json({ error: "User not allowed" });
        }
        const data = await getAllLog();
        return res.status(200).json(data);
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }
    case "POST": {
      try {
        const { userId } = await validateKeycloakToken(req, res);
        let user = await prisma.user.findUnique({
          where: { sub: userId },
        });

        if (!user) {
          return res.status(403).json({ error: "User not found" });
        }
        const logToInsert = {
          userId: user.id,
          eventType: req?.body?.eventType,
          description: req?.body?.description,
          metadata: req?.body?.metadata,
        };
        const data = await createLog(logToInsert);
        return res.status(201).json(data);
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
