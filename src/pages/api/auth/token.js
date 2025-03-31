import jwt from "jsonwebtoken"
import { getCookies } from "@/utils/cookies"
import refreshAccessToken from "@/utils/refreshAccessToken"
import setAuthCookies from "@/utils/setAuthCookies"

export default async function handler(req, res) {
  const cookies = getCookies(req)
  const access_token =
    req.headers.authorization?.split(" ")[1] || cookies.access_token
  const refreshToken = req.headers?.refresh_token || cookies?.refresh_token

  if (access_token) {
    try {
      const decoded = jwt.decode(access_token)
      const currentTime = Math.floor(Date.now() / 1000)

      if (decoded?.exp && decoded.exp > currentTime + 60) {
        return res.status(200).json({ access_token })
      }
    } catch (err) {
      console.warn("Token inválido o no decodificable", err)
    }
  }

  try {
    const tokenData = await refreshAccessToken(refreshToken)

    if (!tokenData) {
      return res.status(401).json({ error: "Failed to refresh token" })
    }

    const newTokenData = {
      access_token: {
        value: tokenData.access_token,
        maxAge: tokenData.expires_in
      },
      refresh_token: {
        value: tokenData.refresh_token,
        maxAge: tokenData.expires_in
      },
      id_token: {
        value: tokenData.id_token,
        maxAge: tokenData.expires_in
      }
    }

    setAuthCookies(req, res, newTokenData)
    return res.status(200).json({ access_token: tokenData.access_token })
  } catch (error) {
    console.error("Error refreshing token:", error.message)
    return res.status(401).json({ error: "Failed to refresh token" })
  }
}
