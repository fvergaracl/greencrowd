import { useEffect } from "react";
import { useRouter } from "next/router";
import { logEvent } from "@/utils/logger";
import { useTranslation } from "@/hooks/useTranslation";

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    logEvent("PAGE_NOT_FOUND", "User landed on a 404 page", {
      path: router.asPath,
    });
  }, [router.asPath]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{t("404 - Page Not Found")}</h1>
      <p>
        {t("The page you are looking for does not exist or has been moved")}.
      </p>
      <button
        onClick={() => router.push("/")}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {t("Go back to home")}
      </button>
    </div>
  );
}
