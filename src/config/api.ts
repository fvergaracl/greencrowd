import getConfig from "next/config"

const { publicRuntimeConfig } = getConfig()

export const API_BASE_URL = publicRuntimeConfig.NEXT_PUBLIC_API_BASE_URL
