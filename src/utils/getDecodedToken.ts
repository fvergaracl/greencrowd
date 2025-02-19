type JwtPayload = Record<string, unknown>; // Generic type for the payload

/**
 * Decodes a JSON Web Token (JWT) and returns its payload.
 * Works in both browser and Node.js environments.
 *
 * @param token - The JWT as a string.
 * @returns The decoded payload or `null` if invalid.
 */
const decodeJwt = (token: string): JwtPayload | null => {
  if (!token) {
    console.error("Token not provided");
    return null;
  }

  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) {
      throw new Error("Invalid token format");
    }

    // Safe decoding (works in both browsers and Node.js)
    const decodedString =
      typeof window !== "undefined"
        ? atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
        : Buffer.from(payloadBase64, "base64").toString("utf-8");

    return JSON.parse(decodedString) as JwtPayload;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};


export default decodeJwt
