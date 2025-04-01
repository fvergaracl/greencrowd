export const getApiBaseUrl = (): string => {
  if (
    typeof window !== "undefined" &&
    window.__ENV__?.NEXT_PUBLIC_API_BASE_URL
  ) {
    return window.__ENV__.NEXT_PUBLIC_API_BASE_URL;
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
};

export const getApiGameBaseUrl = (): string => {
  if (
    typeof window !== "undefined" &&
    window.__ENV__?.NEXT_PUBLIC_API_GAME_BASE_URL
  ) {
    return window.__ENV__.NEXT_PUBLIC_API_GAME_BASE_URL;
  }

  return (
    process.env.NEXT_PUBLIC_API_GAME_BASE_URL || "http://localhost:3000/api/v1"
  );
};

export const getLogginEnabled = (): boolean => {
  if (
    typeof window !== "undefined" &&
    window.__ENV__?.NEXT_PUBLIC_LOGGING_ENABLED
  ) {
    return window.__ENV__.NEXT_PUBLIC_LOGGING_ENABLED === "true";
  }

  return process.env.NEXT_PUBLIC_LOGGING_ENABLED === "true";
};

export const getSentryEnabled = (): boolean => {
  if (
    typeof window !== "undefined" &&
    window.__ENV__?.NEXT_PUBLIC_SENTRY_ENABLED
  ) {
    return window.__ENV__.NEXT_PUBLIC_SENTRY_ENABLED === "true";
  }

  return process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true";
};

export const getSentryDSN = (): string => {
  if (
    typeof window !== "undefined" &&
    window.__ENV__?.NEXT_PUBLIC_SENTRY_DSN_FRONTEND
  ) {
    return window.__ENV__.NEXT_PUBLIC_SENTRY_DSN_FRONTEND;
  }

  return process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND || "";
};
