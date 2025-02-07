import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Survey, Model } from "survey-react-ui";
import { MdOutlineAssignment } from "react-icons/md";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/AdminLayout";
import { getApiBaseUrl } from "@/config/api";
import { useTranslation } from "@/hooks/useTranslation";

interface TaskDetails {
  id: string;
  title: string;
  description: string | null;
  type: string;
  disabled: boolean;
  pointOfInterest: {
    id: string;
    name: string;
    area: {
      id: string;
      name: string;
      campaign: {
        id: string;
        name: string;
      };
    };
  };
  taskData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default function TaskDetailsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(
          `${getApiBaseUrl()}/admin/tasks/${id}`
        );
        setTask(response.data);
      } catch (err) {
        console.error("Failed to fetch task details:", err);
        setError(t("Failed to load task details"));
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  const handleEdit = () => {
    if (task) {
      router.push(`/admin/tasks/${task.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (task) {
      try {
        await axios.delete(`${getApiBaseUrl()}/admin/tasks/${task.id}`);
        router.push("/admin/tasks");
      } catch (err) {
        console.error("Failed to delete task:", err);
        setError(t("Failed to delete task"));
      }
    }
  };

  if (loading) {
    return <div>{t("Loading...")}</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!task) {
    return <div>{t("No task found")}.</div>;
  }

  const surveyModel = new Model(task.taskData);

  return (
    <DefaultLayout>
      <Breadcrumb
        icon={<MdOutlineAssignment />}
        pageName={task.title}
        breadcrumbPath={`Tasks / ${task.title}`}
      />

      <div className="overflow-x-auto rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {t("Task Details")}
        </h1>

        <div className="space-y-4">
          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              {t("Title")}:
            </strong>
            <p className="text-gray-800 dark:text-white">{task.title}</p>
          </div>

          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              {t("Description")}:
            </strong>
            <p className="text-gray-800 dark:text-white">
              {task.description || "N/A"}
            </p>
          </div>

          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              {t("Type")}:
            </strong>
            <p className="text-gray-800 dark:text-white">{task.type}</p>
          </div>

          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              {t("Associated POI")}:
            </strong>
            <p className="text-gray-800 dark:text-white">
              {task.pointOfInterest.name}
            </p>
          </div>

          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              {t("Area")}:
            </strong>
            <p className="text-gray-800 dark:text-white">
              {task.pointOfInterest.area.name}
            </p>
          </div>

          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              {t("Campaign")}:
            </strong>
            <p className="text-gray-800 dark:text-white">
              {task.pointOfInterest.area.campaign.name}
            </p>
          </div>

          <strong className="text-gray-700 dark:text-gray-300">
            {t("Task Preview")}:
          </strong>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 dark:bg-gray-800">
            <Survey model={surveyModel} />
            <p className="text-sm text-gray-500 mt-2">
              {t("This is a preview of the task form")}.
            </p>
          </div>

          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              {t("Created At")}:
            </strong>
            <p className="text-gray-800 dark:text-white">
              {new Date(task.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <strong className="text-gray-700 dark:text-gray-300">
              {t("Updated At")}:
            </strong>
            <p className="text-gray-800 dark:text-white">
              {new Date(task.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            {t("Edit Task")}
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
}
