import axios from "axios"

/**
 * Interface representing the expected response from Keycloak's token endpoint.
 */
interface KeycloakTokenResponse {
  access_token: string
  refresh_token: string
  id_token: string
  expires_in: number
  refresh_expires_in: number
  token_type: string
  not_before_policy: number
  session_state: string
  scope: string
}

/**
 * Attempts to refresh the access token using the provided refresh token.
 *
 * @param refreshToken - The refresh token stored in cookies
 * @returns A new set of tokens if the refresh was successful, or `null` if it failed
 */
export async function tryRefreshToken(
  refreshToken: string
): Promise<KeycloakTokenResponse | null> {
  try {
    const params = new URLSearchParams()
    params.append("grant_type", "refresh_token")
    params.append("client_id", process.env.KEYCLOAK_CLIENT_ID!)
    params.append("client_secret", process.env.KEYCLOAK_CLIENT_SECRET!)
    params.append("refresh_token", refreshToken)

    const tokenEndpoint = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`

    const response = await axios.post<KeycloakTokenResponse>(
      tokenEndpoint,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    )

    return response.data
  } catch (err: any) {
    console.warn(
      "Failed to refresh token:",
      err?.response?.data || err.message || err
    )
    return null
  }
}
