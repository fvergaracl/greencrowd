import { NextApiRequest, NextApiResponse } from "next"
import { clearCookies } from "@/utils/cookies"

/**
 * Clears all cookies in the request by setting them to expire immediately.
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 */
export default async function clearAllCookies(
  req: NextApiRequest,
  res: NextApiResponse
) {
  clearCookies(req, res)
}
