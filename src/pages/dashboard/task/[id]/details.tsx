import { useRouter } from "next/router";
import { Key, useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { getApiBaseUrl } from "@/config/api";
import { useTranslation } from "@/hooks/useTranslation";
import { SurveyModel } from "survey-core";
import { Survey } from "survey-react-ui";
import { logEvent } from "@/utils/logger";
import GoBack from "@/components/Admin/GoBack";

import "survey-core/defaultV2.min.css";

export default function TaskDetailsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const [taskDetails, setTaskDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(
          `${getApiBaseUrl()}/task/${id}/details`
        );
        setTaskDetails(response.data);
      } catch (error) {
        console.error("Error fetching task details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center text-gray-600 py-10">{t("Loading...")}</div>
      </DashboardLayout>
    );
  }

  if (!taskDetails) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500 py-10">
          {t("Task not found")}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-6 border border-gray-100">
        <GoBack
          data-cy="go-back-link-from-task-detail"
          className="text-blue-600 cursor-pointer mb-4 inline-block text-xl font-bold"
          event={{
            eventType: "GO_BACK_FROM_TASK_DETAIL",
            description: "User clicked go back from task detail",
            metadata: { taskId: id },
          }}
        />
        <h1 className="text-2xl font-bold text-black-700 mb-4 text-center">
          {taskDetails.title}
        </h1>
        <p className="text-sm text-gray-500 mb-3">{taskDetails.description}</p>
        <div className="text-xs text-gray-600 mb-4">
          🗓 {t("Created at")}:{" "}
          {new Date(taskDetails.createdAt).toLocaleString()}
        </div>

        {taskDetails.taskData && (
          <div className="mb-6">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
              <Survey
                model={(() => {
                  const model = new SurveyModel(taskDetails.taskData);
                  model.mode = "display";
                  return model;
                })()}
              />
            </div>
          </div>
        )}

        {taskDetails.UserTaskResponses?.length > 0 ? (
          <div className="space-y-4 mt-6">
            <h3 className="text-md font-semibold text-blue-600">
              {t("Responses")}
            </h3>

            {taskDetails.UserTaskResponses.map(
              (res: { id: Key; createdAt: string | number | Date }) => (
                <div
                  key={res.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-gray-500">🕒</span>
                      <span className="font-medium">
                        {new Date(res.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        logEvent(
                          "CLICKED_VIEW_RESPONSE_IN_TASK_DETAILS",
                          "User clicked on view response in task details",
                          { taskId: id, responseId: res.id }
                        );
                        router.push(`/dashboard/task/${id}/response/${res.id}`);
                      }}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                    >
                      🔍 {t("View Response")}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-6 border border-gray-100">
            <div className="text-sm text-gray-500 italic text-center">
              {t("No responses yet")}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
