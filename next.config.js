const { withSentryConfig } = require("@sentry/nextjs")
const { i18n } = require("./next-i18next.config")
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development"
})

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL
  },
  experimental: {
    trustHostHeader: true
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Forwarded-Proto", value: "https" }]
      }
    ]
  },
  i18n,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      {
        protocol: "https",
        hostname: "me.greengage-project.eu",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "me.13-50-150-58.nip.io",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "minioapi.13-50-150-58.nip.io",
        pathname: "/**"
      },
      { protocol: "https", hostname: "googleusercontent.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: ".*.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "interralink.16.171.94.204.nip.io",
        pathname: "/**"
      }
    ]
  },
  webpack: (config, { isServer }) => {
    return config
  }
})

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "projectgreengage",
    project: "javascript-nextjs"
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true
  }
)
