import { useRouter } from "next/router";
import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { getApiBaseUrl } from "@/config/api";
import axios from "axios";
import { logEvent } from "@/utils/logger";

export default function MyTaskActivity() {
  const router = useRouter();
  const [myActivityData, setMyActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("hierarchical");
  const [expandedCampaigns, setExpandedCampaigns] = useState<
    Record<string | number, boolean>
  >({});
  const [expandedTasks, setExpandedTasks] = useState<
    Record<string | number, boolean>
  >({});

  const { t } = useTranslation();

  useEffect(() => {
    const fetchMyActivity = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/task/me`);
        setMyActivityData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching my task activity:", error);
        setLoading(false);
      }
    };
    fetchMyActivity();
  }, []);

  const renderTaskDetailsButton = (task: {
    title: any;
    description: any;
    createdAt: string | number | Date;
  }) => {
    return (
      <button
        onClick={() => {
          logEvent(
            "VIEW_TASK_DETAILS_FROM_MY_ACTIVITY",
            "User clicked view task details",
            {
              taskId: task.id,
            }
          );
          router.push(`/dashboard/task/${task.id}/details`);
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-sm rounded"
      >
        {t("View Details")}
      </button>
    );
  };

  const toggleExpand = (taskId: string | number) => {
    logEvent(
      "TOGGLE_RESPONSES_FROM_MY_ACTIVITY",
      "User clicked toggle responses",
      {
        expandedTasks,
        taskId,
      }
    );
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const renderHierarchicalView = () => {
    return myActivityData.map(
      (campaign: {
        id: string | number;
        name: string;
        description: string;
        areas: any[];
      }) => {
        const isCampaignExpanded =
          expandedCampaigns[campaign.id as string | number] ?? false;

        return (
          <div
            key={campaign.id}
            className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100  mx-4"
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xl font-bold text-blue-700">
                {campaign.name}
              </h3>
              <button
                onClick={() => {
                  logEvent(
                    "TOGGLE_TASKS_FROM_MY_ACTIVITY",
                    "User clicked toggle tasks",
                    {
                      expandedCampaigns,
                      campaignId: campaign.id,
                    }
                  );

                  setExpandedCampaigns((prev) => ({
                    ...prev,
                    [campaign.id]: !isCampaignExpanded,
                  }));
                }}
                className="text-xs px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition"
              >
                {isCampaignExpanded ? t("▲ Hide Tasks") : t("▼ Show Tasks")}
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-4">{campaign.description}</p>

            {isCampaignExpanded &&
              campaign.areas.map((area) => (
                <div
                  key={area.id}
                  className="ml-2 pl-3 border-l-4 border-blue-100 mb-4"
                >
                  <h4 className="text-lg font-semibold text-blue-600">
                    {area.name}
                  </h4>
                  <p className="text-gray-500 text-sm mb-3">
                    {area.description}
                  </p>

                  {area.pointOfInterests.map(
                    (poi: {
                      id: Key;
                      name:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | ReactPortal
                        | Promise<AwaitedReactNode>;
                      description:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | ReactPortal
                        | Promise<AwaitedReactNode>;
                      tasks: any[];
                    }) => (
                      <div
                        key={poi.id}
                        className="ml-2 pl-3 border-l-4 border-blue-200 mb-3 bg-gray-50 rounded-lg p-2"
                      >
                        <h5 className="text-base font-medium text-blue-500">
                          {poi.name}
                        </h5>
                        <p className="text-gray-500 text-sm mb-2">
                          {poi.description}
                        </p>

                        {poi.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="ml-2 mb-2 p-3 bg-white border border-gray-200 rounded-xl shadow-sm"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-800">
                                {task.title}
                              </span>
                              <div className="flex gap-2">
                                {task.description
                                  ? renderTaskDetailsButton({
                                      ...task,
                                      description:
                                        task.description ||
                                        t("No description available"),
                                    })
                                  : null}
                                {task.UserTaskResponses?.length > 0 && (
                                  <button
                                    onClick={() => toggleExpand(task.id)}
                                    className="text-xs px-2 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition"
                                  >
                                    {expandedTasks[task.id]
                                      ? t("▲ Hide Responses")
                                      : t("▼ Show Responses")}
                                  </button>
                                )}
                              </div>
                            </div>

                            {expandedTasks[task.id] && (
                              <div className="mt-2 ml-3 space-y-2">
                                {task.UserTaskResponses.map(
                                  (res: {
                                    id: Key;
                                    createdAt: string | number | Date;
                                  }) => (
                                    <div
                                      key={res.id}
                                      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2"
                                    >
                                      <div className="text-xs text-gray-600 flex items-center gap-1">
                                        🕒{" "}
                                        {new Date(
                                          res.createdAt
                                        ).toLocaleString()}
                                      </div>
                                      <button
                                        onClick={() => {
                                          logEvent(
                                            "VIEW_RESPONSE_FROM_MY_ACTIVITY",
                                            "User clicked view response",
                                            {
                                              taskId: task.id,
                                              responseId: res.id,
                                            }
                                          );

                                          router.push(
                                            `/dashboard/task/${task.id}/response/${res.id}`
                                          );
                                        }}
                                        className="text-xs px-2 py-1 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium transition"
                                      >
                                        🔍 {t("View Response")}
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              ))}
          </div>
        );
      }
    );
  };

  const renderGroupedByCampaignView = () => {
    return myActivityData.map((campaign) => {
      const isCampaignExpanded = expandedCampaigns[campaign.id] ?? false;

      return (
        <div
          key={campaign.id}
          className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100 mx-4"
        >
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xl font-bold text-blue-700">{campaign.name}</h3>
            <button
              onClick={() => {
                logEvent(
                  "TOGGLE_TASKS_FROM_MY_ACTIVITY",
                  "User clicked toggle tasks",
                  {
                    expandedCampaigns,
                    campaignId: campaign.id,
                  }
                );
                setExpandedCampaigns((prev) => ({
                  ...prev,
                  [campaign.id]: !isCampaignExpanded,
                }));
              }}
              className="text-xs px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition"
            >
              {isCampaignExpanded ? t("▲ Hide Tasks") : t("▼ Show Tasks")}
            </button>
          </div>

          <p className="text-gray-500 text-sm mb-4">{campaign.description}</p>

          {isCampaignExpanded && (
            <div className="space-y-3">
              {campaign.areas.flatMap((area: { pointOfInterests: any[] }) =>
                area.pointOfInterests.flatMap((poi) =>
                  poi.tasks.map(
                    (task: {
                      id?: any;
                      title: any;
                      UserTaskResponses?: any;
                      description?: any;
                      createdAt?: string | number | Date;
                    }) => (
                      <div
                        key={task.id}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-800">
                            {task.title}
                          </span>
                          <div className="flex gap-2">
                            {renderTaskDetailsButton({
                              title: task.title,
                              description:
                                task.description ||
                                t("No description available"),
                              createdAt: task.createdAt,
                            })}
                            {task.UserTaskResponses?.length > 0 && (
                              <button
                                onClick={() => toggleExpand(task.id)}
                                className="text-xs px-2 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition"
                              >
                                {expandedTasks[task.id]
                                  ? t("▲ Hide Responses")
                                  : t("▼ Show Responses")}
                              </button>
                            )}
                          </div>
                        </div>

                        {expandedTasks[task.id] && (
                          <div className="mt-2 ml-3 space-y-2">
                            {task.UserTaskResponses.map(
                              (res: {
                                id: Key;
                                createdAt: string | number | Date;
                              }) => (
                                <div
                                  key={res.id}
                                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2"
                                >
                                  <div className="text-xs text-gray-600 flex items-center gap-1">
                                    🕒{" "}
                                    {new Date(res.createdAt).toLocaleString()}
                                  </div>
                                  <button
                                    onClick={() => {
                                      logEvent(
                                        "VIEW_RESPONSE_FROM_MY_ACTIVITY",
                                        "User clicked view response",
                                        {
                                          taskId: task.id,
                                          responseId: res.id,
                                        }
                                      );
                                      router.push(
                                        `/dashboard/task/${task.id}/response/${res.id}`
                                      );
                                    }}
                                    className="text-xs px-2 py-1 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium transition"
                                  >
                                    🔍 {t("View Response")}
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )
                )
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-semibold text-gray-800 pt-4 text-center">
        {t("My Task Activity")}
      </h2>

      <div className="flex justify-center space-x-4 my-4">
        <button
          className={`px-4 py-2 rounded ${viewMode === "hierarchical" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => {
            logEvent(
              "CHANGE_VIEW_MODE_FROM_MY_ACTIVITY",
              "User clicked change view mode",
              {
                viewMode,
              }
            );
            setViewMode("hierarchical");
          }}
        >
          {t("Hierarchical View")}
        </button>
        <button
          className={`px-4 py-2 rounded ${viewMode === "grouped" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => {
            logEvent(
              "CHANGE_VIEW_MODE_FROM_MY_ACTIVITY",
              "User clicked change view mode",
              {
                viewMode,
              }
            );
            setViewMode("grouped");
          }}
        >
          {t("Grouped by Campaign")}
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">{t("Loading...")}</p>
      ) : viewMode === "hierarchical" ? (
        renderHierarchicalView()
      ) : (
        renderGroupedByCampaignView()
      )}
    </DashboardLayout>
  );
}
