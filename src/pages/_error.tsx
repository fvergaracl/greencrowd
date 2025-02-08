import { useEffect } from "react";
import { NextPageContext } from "next";
import { logEvent } from "@/utils/logger";

function Error({ statusCode }: { statusCode?: number }) {
  useEffect(() => {
    logEvent("RENDER_ERROR_SCREEN", "User viewed the error screen", {
      statusCode: statusCode,
    });
  }, []);

  return (
    <p>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : "An error occurred on client"}
    </p>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
