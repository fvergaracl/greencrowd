import { NextApiResponse } from "next"
import { setCookies } from "@/utils/cookies"

interface TokenData {
  value: string
  maxAge: number
}

interface TokenProps {
  access_token: TokenData
  refresh_token: TokenData
  id_token: TokenData
}

/**
 * Sets authentication cookies for the user.
 * @param res - Next.js API response object
 * @param propsToken - Object containing access, refresh, and ID tokens
 */
const setAuthCookies = (res: NextApiResponse, propsToken: TokenProps): void => {
  const { access_token, refresh_token, id_token } = propsToken

  setCookies(
    res,
    {
      access_token: access_token?.value,
      refresh_token: refresh_token?.value,
      id_token: id_token?.value
    },
    access_token?.maxAge
  )
}

export default setAuthCookies
