import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "@/hooks/useTranslation";
import { logEvent } from "@/utils/logger";

interface Ievent {
  eventType: string;
  description: string;
  metadata?: Record<string, any>;
}

interface GoBackProps {
  customLink?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  "data-cy"?: string;
  event?: Ievent | null;
}

const GoBack: React.FC<GoBackProps> = ({
  customLink,
  label = "← Back",
  className = "text-blue-600 cursor-pointer mb-4 inline-block",
  style = {},
  "data-cy": dataCy = "go-back-link",
  event,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (event) {
      logEvent(event.eventType, event.description, event.metadata);
    }
    if (customLink) {
      router.push(customLink);
    } else {
      router.back();
    }
  };

  return (
    <a
      onClick={handleClick}
      className={className}
      style={style}
      data-cy={dataCy}
      href={customLink || "#"}
    >
      {t(label)}
    </a>
  );
};

export default GoBack;
