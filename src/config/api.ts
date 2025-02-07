export const API_BASE_URL =
  typeof window !== "undefined" && (window as any).__ENV__
    ? (window as any).__ENV__.API_BASE_URL
    : process.env.API_BASE_URL || "https://default.example.com/api";
