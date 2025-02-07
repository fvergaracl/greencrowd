export const API_BASE_URL =
  typeof window !== "undefined" && (window as any).__ENV__
    ? (window as any).__ENV__.NEXT_PUBLIC_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL || "https://default.example.com/api";
