export const getApiBaseUrl = (): string => {
  if (
    typeof window !== "undefined" &&
    window.__ENV__?.NEXT_PUBLIC_API_BASE_URL
  ) {
    console.log(
      "[+] Usando API_BASE_URL desde window.__ENV__:",
      window.__ENV__.NEXT_PUBLIC_API_BASE_URL
    );
    return window.__ENV__.NEXT_PUBLIC_API_BASE_URL;
  }

  console.log(
    "[-] Usando API_BASE_URL desde process.env:",
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"
  );
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
};

export const getLogginEnabled = (): boolean => {
  if (
    typeof window !== "undefined" &&
    window.__ENV__?.NEXT_PUBLIC_LOGGING_ENABLED
  ) {
    console.log(
      "[+] Usando LOGGING_ENABLED desde window.__ENV__:",
      window.__ENV__.NEXT_PUBLIC_LOGGING_ENABLED
    );
    return window.__ENV__.NEXT_PUBLIC_LOGGING_ENABLED === "true";
  }

  console.log(
    "[-] Usando LOGGING_ENABLED desde process.env:",
    process.env.NEXT_PUBLIC_LOGGING_ENABLED === "true"
  );
  return process.env.NEXT_PUBLIC_LOGGING_ENABLED === "true";
};
