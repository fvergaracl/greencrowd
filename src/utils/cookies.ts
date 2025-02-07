import { NextApiResponse, NextApiRequest } from "next"
import * as cookie from "cookie";

/**
 * Defines common cookie configuration options.
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "None",
  path: "/"
}

/**
 * Sets multiple cookies in the response.
 * @param res - Next.js HTTP response
 * @param cookies - Object containing cookies to set
 * @param maxAge - Optional max age for the cookies in seconds
 */
export const setCookies = (
  res: NextApiResponse,
  cookies: Record<string, string | null>,
  maxAge?: number
) => {
  if (!res) {
    console.warn("setCookies: Response object is undefined.")
    return
  }

  const validCookies = Object.entries(cookies)
    .filter(([_, value]) => typeof value === "string" && value.trim() !== "") // Ensure value is valid
    .map(([key, value]) =>
      cookie.serialize(key, value as string, {
        ...COOKIE_OPTIONS,
        maxAge: value ? maxAge : 0
      })
    )

  if (validCookies.length > 0) {
    res.setHeader("Set-Cookie", validCookies)
  } else {
    console.warn("setCookies: No valid cookies to set.")
  }
}

/**
 * Clears all cookies set in the response.
 * @param req - Next.js HTTP request (used to read current cookies)
 * @param res - Next.js HTTP response
 */
export const clearCookies = (req: NextApiRequest, res: NextApiResponse) => {
  if (!req || !res) {
    console.warn("clearCookies: Request or Response object is undefined.")
    return
  }

  if (!req.headers.cookie) {
    console.warn("clearCookies: No cookies found in request.")
    return
  }

  const parsedCookies = cookie.parse(req.headers.cookie)
  if (Object.keys(parsedCookies).length === 0) {
    console.warn("clearCookies: No cookies to clear.")
    return
  }

  const expiredCookies = Object.keys(parsedCookies).map(cookieName =>
    cookie.serialize(cookieName, "", {
      ...COOKIE_OPTIONS,
      expires: new Date(0)
    })
  )

  res.setHeader("Set-Cookie", expiredCookies)
}

/**
 * Retrieves cookies from the request.
 * @param req - Next.js HTTP request
 * @returns An object containing parsed cookies
 */
export const getCookies = (req: NextApiRequest): Record<string, string> => {
  if (!req || !req.headers || !req.headers.cookie) {
    return {}
  }
  return cookie.parse(req.headers.cookie)
}
