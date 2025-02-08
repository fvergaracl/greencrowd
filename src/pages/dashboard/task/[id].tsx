import React, { useState, useEffect, useRef } from "react";
import DistanceIndicator from "@/components/Common/Map/DistanceIndicator";
import DashboardLayout from "@/components/DashboardLayout";
import GoBack from "@/components/Admin/GoBack";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboard } from "@/context/DashboardContext";
import { useRouter } from "next/router";
import { SurveyModel } from "survey-core";
import { Survey } from "survey-react-ui";
import axios from "axios";
import "survey-core/defaultV2.min.css";
import Swal from "sweetalert2";
import { getApiBaseUrl } from "@/config/api";

const TaskWrapperComponent = ({
  taskData,
  t,
  isInside,
  onComplete,
}: {
  taskData: any;
  t: any;
  isInside: boolean;
  onComplete: (survey: any, setIsSubmitted: (value: boolean) => void) => void;
}) => {
  const surveyRef = useRef<SurveyModel | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!surveyRef.current && taskData) {
    surveyRef.current = new SurveyModel({
      ...taskData,
      completeText: t("Submit"),
      showCompletedPage: false,
    });
  }

  const form = surveyRef.current;

  useEffect(() => {
    if (!form) return;

    // form.onUpdateQuestionCssClasses = (_, options) => {
    //   if (options.cssClasses.navigation) {
    //     options.cssClasses.navigation += isInside
    //       ? ""
    //       : " opacity-50 pointer-events-none";
    //   }
    // };
  }, [isInside]);

  if (!form) return <p>Cargando encuesta...</p>;

  return (
    <div>
      {isSubmitted ? (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          <p>{t("Thank you for completing the task!")}</p>
        </div>
      ) : (
        <Survey
          model={form}
          onComplete={(survey: any) => {
            console.log("Survey completed <<<<<<<<<<<<<<<<<");
            onComplete(survey, setIsSubmitted);
          }}
        />
      )}
    </div>
  );
};

TaskWrapperComponent.displayName = "TaskWrapper";

const TaskWrapper = React.memo(
  TaskWrapperComponent,
  (prevProps, nextProps) => prevProps.taskData === nextProps.taskData
);

export default function Task() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const { position } = useDashboard();

  const [task, setTask] = useState<any>(null);
  const [isInside, setIsInside] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await axios.get(`${getApiBaseUrl()}/task/${id}`);
        setTask(data);
      } catch (error) {
        console.error("Error fetching task data:", error);
      }
      setLoading(false);
    };
    if (id) {
      fetchTask();
    }
  }, [id]);

  const handleSurveyCompletion = async (
    survey: SurveyModel,
    setIsSubmitted: (value: boolean) => void
  ) => {
    console.log("----------------1");
    if (!isInside) {
      Swal.fire({
        title: t("You are not inside the point of interest"),
        text: t(
          "You must be inside the point of interest to complete the task"
        ),
        icon: "error",
      });
      return;
    }

    Swal.fire({
      title: t("Are you sure?"),
      text: t("You want to submit the response?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("Yes"),
      cancelButtonText: t("No"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`${getApiBaseUrl()}/task/${id}/response`, {
            taskResponse: survey.data,
            taskId: id,
            position,
          });

          Swal.fire(
            t("Success!"),
            t("Task completed successfully!"),
            "success"
          );
          setIsSubmitted(true);
        } catch (error) {
          console.error("Error completing task:", error);
          Swal.fire(
            t("Error!"),
            t(error?.response?.data?.error || t("An error occurred")),
            "error"
          );
        }
      } else {
        Swal.fire(t("Submission cancelled"), "", "info");
        survey.isCompleted = false;
      }
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <p className="text-gray-500">{t("Loading task data...")}</p>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="p-4">
        {task?.pointOfInterest && position ? (
          <DistanceIndicator
            poi={task.pointOfInterest}
            onRadiusChange={(isInsidePOI) => {
              setIsInside(!!isInsidePOI);
            }}
          />
        ) : null}
        <div className="bg-white shadow-md rounded-lg p-6">
          <GoBack
            data-cy="go-back-task"
            className="text-blue-600 cursor-pointer mt-8 mb-4 inline-block"
          />

          {task ? (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {task.title}
              </h1>
              <p className="text-gray-700 mb-6">{task.description}</p>

              {task.taskData ? (
                <div>
                  <TaskWrapper
                    taskData={task.taskData}
                    t={t}
                    isInside={isInside}
                    onComplete={handleSurveyCompletion}
                  />
                </div>
              ) : (
                <p className="text-gray-500">
                  {t(
                    "This task type is not supported. Please contact the administrator."
                  )}
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-500">
              {t("Task not found. Please contact the administrator.")}
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
