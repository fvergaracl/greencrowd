// userInfoCache.ts
const cache = new Map<string, { data: any; expiresAt: number }>()

export async function getCachedUserInfo(
  token: string,
  fetchFn: (token: string) => Promise<any>
) {
  const cached = cache.get(token)
  const now = Date.now()

  if (cached && cached.expiresAt > now) {
    return cached.data
  }

  const data = await fetchFn(token)
  const decoded = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString("utf-8")
  )
  const expiresIn = decoded.exp ? decoded.exp * 1000 - now : 300000 // fallback 5 min
  cache.set(token, { data, expiresAt: now + expiresIn })

  return data
}
