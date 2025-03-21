import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboard } from "@/context/DashboardContext";
import { getApiBaseUrl } from "@/config/api";
import axios from "axios";

export default function MyTaskActivity() {
  const [accessToken, setAccessToken] = useState(null);
  const [myActivityData, setMyActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("hierarchical");
  const [expandedTasks, setExpandedTasks] = useState({});

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

  const renderTaskDetailsButton = (task) => {
    return (
      <button
        onClick={() => {
          const win = window.open("", "_blank");
          if (win) {
            win.document.write(`<h2>${task.title}</h2>`);
            win.document.write(`<p>${task.description}</p>`);
            win.document.write(
              `<small>Created at: ${new Date(task.createdAt).toLocaleString()}</small>`
            );
          }
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-sm rounded"
      >
        View Details
      </button>
    );
  };

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const renderHierarchicalView = () => {
    return myActivityData.map((campaign) => (
      <div
        key={campaign.id}
        className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100"
      >
        <h3 className="text-xl font-bold text-blue-700 mb-1">
          {campaign.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4">{campaign.description}</p>

        {campaign.areas.map((area) => (
          <div
            key={area.id}
            className="ml-2 pl-3 border-l-4 border-blue-100 mb-4"
          >
            <h4 className="text-lg font-semibold text-blue-600">{area.name}</h4>
            <p className="text-gray-500 text-sm mb-3">{area.description}</p>

            {area.pointOfInterests.map((poi) => (
              <div
                key={poi.id}
                className="ml-2 pl-3 border-l-4 border-blue-200 mb-3 bg-gray-50 rounded-lg p-2"
              >
                <h5 className="text-base font-medium text-blue-500">
                  {poi.name}
                </h5>
                <p className="text-gray-500 text-sm mb-2">{poi.description}</p>

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
                        {renderTaskDetailsButton(task)}
                        {task.UserTaskResponses?.length > 0 && (
                          <button
                            onClick={() => toggleExpand(task.id)}
                            className="text-xs px-2 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition"
                          >
                            {expandedTasks[task.id]
                              ? "Hide Dates"
                              : "Show Dates"}
                          </button>
                        )}
                      </div>
                    </div>

                    {expandedTasks[task.id] && (
                      <div className="mt-2 ml-3 space-y-2">
                        {task.UserTaskResponses.map((res) => (
                          <div
                            key={res.id}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2"
                          >
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              🕒 {new Date(res.createdAt).toLocaleString()}
                            </div>
                            <button
                              onClick={() => {
                                const win = window.open("", "_blank");
                                if (win) {
                                  win.document.write(`<h2>Task Response</h2>`);
                                  win.document.write(
                                    `<p><strong>Created at:</strong> ${new Date(res.createdAt).toLocaleString()}</p>`
                                  );
                                  // Aquí podrías imprimir más datos cuando lo tengas
                                  win.document.write(
                                    `<p><em>Here goes full response content...</em></p>`
                                  );
                                }
                              }}
                              className="text-xs px-2 py-1 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium transition"
                            >
                              🔍 {t("View Response")}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    ));
  };

  const renderGroupedByCampaignView = () => {
    return myActivityData.map((campaign) => (
      <div
        key={campaign.id}
        className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100"
      >
        <h3 className="text-xl font-bold text-blue-700 mb-1">
          {campaign.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4">{campaign.description}</p>

        <div className="space-y-3">
          {campaign.areas.flatMap((area) =>
            area.pointOfInterests.flatMap((poi) =>
              poi.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-800">
                      {task.title}
                    </span>
                    <div className="flex gap-2">
                      {renderTaskDetailsButton(task)}
                      {task.UserTaskResponses?.length > 0 && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="text-xs px-2 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition"
                        >
                          {expandedTasks[task.id] ? "Hide Dates" : "Show Dates"}
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedTasks[task.id] && (
                    <div className="mt-2 ml-3 space-y-2">
                      {task.UserTaskResponses.map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2"
                        >
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            🕒 {new Date(res.createdAt).toLocaleString()}
                          </div>
                          <button
                            onClick={() => {
                              const win = window.open("", "_blank");
                              if (win) {
                                win.document.write(`<h2>Task Response</h2>`);
                                win.document.write(
                                  `<p><strong>Created at:</strong> ${new Date(res.createdAt).toLocaleString()}</p>`
                                );
                                // Aquí podrías imprimir más datos cuando lo tengas
                                win.document.write(
                                  `<p><em>Here goes full response content...</em></p>`
                                );
                              }
                            }}
                            className="text-xs px-2 py-1 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium transition"
                          >
                            🔍 {t("View Response")}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </div>
    ));
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-semibold text-gray-800 pt-4 text-center">
        {t("My Task Activity")}
      </h2>

      <div className="flex justify-center space-x-4 my-4">
        <button
          className={`px-4 py-2 rounded ${viewMode === "hierarchical" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setViewMode("hierarchical")}
        >
          {t("Hierarchical View")}
        </button>
        <button
          className={`px-4 py-2 rounded ${viewMode === "grouped" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setViewMode("grouped")}
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
