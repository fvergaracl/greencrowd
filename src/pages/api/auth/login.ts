import { NextApiRequest, NextApiResponse } from "next"
import { generateCodeVerifier, generateCodeChallenge } from "@/utils/pkce"
import { setCookies, clearCookies } from "@/utils/cookies"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    KEYCLOAK_BASE_URL,
    KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID,
    NEXTAUTH_URL
  } = process.env

  // Clear authentication-related cookies
  clearCookies(req, res)

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  console.log("Generated Code Verifier:", codeVerifier)
  console.log("Generated Code Challenge:", codeChallenge)

  // Ensure codeVerifier is not undefined before setting cookies
  if (typeof codeVerifier !== "string" || codeVerifier.trim() === "") {
    console.error("Error: Generated code verifier is invalid:", codeVerifier)
    return res.status(500).json({ error: "Failed to generate code verifier" })
  }

  // Debugging: Log before setting the cookie
  console.log("Setting cookie: code_verifier =", codeVerifier)

  setCookies(req, res, { code_verifier: codeVerifier })
  console.log("✅ Cookie `code_verifier` seteada:", codeVerifier)

  // Define logout URL
  const logoutUrl = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(
    `${NEXTAUTH_URL}/api/auth/login`
  )}`

  if (req.query.logout === "true") {
    return res.redirect(logoutUrl)
  }

  // Build authentication URL
  const authUrl =
    `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?` +
    new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID!,
      redirect_uri: `${NEXTAUTH_URL}/api/auth/callback`,
      response_type: "code",
      scope: "openid profile email offline_access greenCrowdScope",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      prompt: "login"
    })

  res.redirect(authUrl)
}
