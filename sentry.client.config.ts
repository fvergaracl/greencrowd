import { getSentryDSN } from "./src/config/api"
import * as Sentry from "@sentry/nextjs"
import { browserTracingIntegration } from "@sentry/browser"

Sentry.init({
  dsn:
    getSentryDSN() ||
    process?.env?.NEXT_PUBLIC_SENTRY_DSN_FRONTEND ||
    window?.__ENV__?.NEXT_PUBLIC_SENTRY_DSN_FRONTEND,
  integrations: [browserTracingIntegration()],
  tracesSampleRate: 1.0
})
