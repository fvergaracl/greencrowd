import getUserInfo from "./getUserInfo"
import { getCachedUserInfo } from "./userInfoCache"
import { getCookies } from "@/utils/cookies"

export async function validateKeycloakToken(req: any, res?: any) {
  try {
    const cookies = getCookies(req)
    const token = cookies.access_token

    if (!token) {
      throw new Error("No access token provided")
    }

    const decoded_token = token.split(".")[1]
    const base64 = decoded_token.replace(/-/g, "+").replace(/_/g, "/")
    const userInfo_decoded = JSON.parse(
      Buffer.from(base64, "base64").toString("binary")
    )
    console.time("TokenValidation")
    const userInfo = await getCachedUserInfo(token, getUserInfo)
    console.timeEnd("TokenValidation")
    const userId = userInfo.sub
    const userRoles = userInfo_decoded?.roles
    if (!userId) {
      throw new Error("User ID not found in token")
    }

    return { userId, userInfo, userRoles }
  } catch (error: any) {
    console.error("Token validation failed:", error.message)
    throw new Error("Unauthorized: Invalid or expired token")
  }
}
