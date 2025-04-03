import { getSentryDSN } from "./src/config/api"
import * as Sentry from "@sentry/nextjs"
import { browserTracingIntegration } from "@sentry/browser"

const sentryDSN =
  getSentryDSN() ||
  process?.env?.NEXT_PUBLIC_SENTRY_DSN_FRONTEND ||
  (typeof window !== "undefined"
    ? window?.__ENV__?.NEXT_PUBLIC_SENTRY_DSN_FRONTEND
    : undefined)

Sentry.init({
  dsn: sentryDSN,
  integrations: [browserTracingIntegration()],
  tracesSampleRate: 1.0
})
