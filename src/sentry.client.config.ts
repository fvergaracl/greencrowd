// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"
import { browserTracingIntegration } from "@sentry/browser"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND || "",
  integrations: [browserTracingIntegration()],
  tracesSampleRate: 1.0
})
