import { getSentryDSN } from "./src/config/api"
import * as Sentry from "@sentry/nextjs"
import { browserTracingIntegration } from "@sentry/browser"

Sentry.init({
  dsn: getSentryDSN(),
  integrations: [browserTracingIntegration()],
  tracesSampleRate: 1.0
})
