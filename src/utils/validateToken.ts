import getUserInfo from "./getUserInfo"
import { getCachedUserInfo } from "./userInfoCache"
import { tryRefreshToken } from "@/utils/tryRefreshToken"
import { getCookies, setCookies } from "@/utils/cookies"

export async function validateKeycloakToken(req: any, res?: any) {
  try {
    const cookies = getCookies(req)
    let token = cookies.access_token
    if (!cookies.refresh_token) {
      console.log("Refresh token is missing in cookies ..... ")
      throw new Error("Refresh token is missing in cookies")
    }

    if (!token && cookies.refresh_token && res) {
      console.log("Access token ausente, intentando refrescar...")

      const newTokenData = await tryRefreshToken(cookies.refresh_token)

      if (newTokenData) {
        setCookies(
          req,
          res,
          {
            access_token: newTokenData.access_token,
            refresh_token: newTokenData.refresh_token,
            id_token: newTokenData.id_token
          },
          newTokenData.expires_in
        )

        token = newTokenData.access_token
      } else {
        throw new Error("Refresh token inválido o expirado")
      }
    }

    if (!token) {
      return null
    }

    const decoded_token = token.split(".")[1]
    const base64 = decoded_token.replace(/-/g, "+").replace(/_/g, "/")
    const userInfo_decoded = JSON.parse(
      Buffer.from(base64, "base64").toString("binary")
    )

    const userInfo = await getCachedUserInfo(token, getUserInfo)
    const userId = userInfo.sub
    const userRoles = userInfo_decoded?.roles

    if (!userId) {
      throw new Error("User ID not found in token")
    }

    return { userId, userInfo, userRoles }
  } catch (error: any) {
    console.error("Token validation failed:", error.message)

    if (res) {
      res.setHeader("Set-Cookie", [
        `access_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
        `refresh_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
        `id_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`
      ])
    }
    if (error.message.includes("Refresh token inválido o expirado")) {
      throw new Error("Unauthorized: Invalid or expired refresh token")
    }
    throw new Error("Unauthorized: Invalid or expired access token.")
  }
}
