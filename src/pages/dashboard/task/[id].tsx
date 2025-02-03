import React, { useState, useEffect } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { useTranslation } from "@/hooks/useTranslation"
import { useDashboard } from "@/context/DashboardContext"
import { useRouter } from "next/router"
import { SurveyModel } from "survey-core"
import { Survey } from "survey-react-ui"
import axios from "axios"
import "survey-core/defaultV2.min.css"
import Swal from "sweetalert2"
import GoBack from "@/components/Admin/GoBack"
import DistanceIndicator from "../../../components/Common/Map/DistanceIndicator"

export default function Task() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const { position } = useDashboard()

  const [task, setTask] = useState<any>(null)
  const [isInside, setIsInside] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await axios.get(`/api/task/${id}`)
        setTask(data)
      } catch (error) {
        console.error("Error fetching task data:", error)
      }
      setLoading(false)
    }
    if (id) {
      fetchTask()
    }
  }, [id])

  const handleSurveyCompletion = async (surveyData: any) => {
    if (!isInside) {
      Swal.fire({
        title: t("You are not inside the point of interest"),
        text: t(
          "You must be inside the point of interest to complete the task"
        ),
        icon: "error"
      })
      return
    }

    Swal.fire({
      title: t("Are you sure?"),
      text: t("You want to submit the response?"),
      icon: "warning",
      showCancelButton: true,

      confirmButtonText: t("Yes"),
      cancelButtonText: t("No")
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          await axios.post(`/api/task/${id}/response`, {
            taskResponse: surveyData,
            taskId: id,
            position
          })
          Swal.fire(t("Success!"), t("Task completed successfully!"), "success")
        } catch (error) {
          console.error("Error completing task:", error)
          Swal.fire(t("Error!"), t(error?.response?.data?.error), "error")
        }
      }
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className='p-4'>
          <p className='text-gray-500'>{t("Loading task data...")}</p>
        </div>
      </DashboardLayout>
    )
  }
  console.log(task)
  return (
    <DashboardLayout>
      <div className='p-4'>
        {task?.pointOfInterest && position ? (
          <DistanceIndicator
            poi={task.pointOfInterest}
            position={position}
            onRadiusChange={isInsidePOI => {
              setIsInside(!!isInsidePOI)
            }}
          />
        ) : null}
        <div className='bg-white shadow-md rounded-lg p-6'>
          <GoBack
            data-cy='go-back-task'
            className='text-blue-600 cursor-pointer mt-8 mb-4 inline-block'
          />

          {task ? (
            <>
              <h1 className='text-2xl font-bold text-gray-800 mb-4'>
                {task.title}
              </h1>
              <p className='text-gray-700 mb-6'>{task.description}</p>

              {task.taskData ? (
                <div>
                  <Survey
                    model={
                      new SurveyModel({
                        ...task.taskData,
                        completeText: t("Submit"),
                        onUpdateQuestionCssClasses: (_, options) => {
                          if (options.cssClasses.navigation) {
                            options.cssClasses.navigation += isInside
                              ? ""
                              : " opacity-50 pointer-events-none"
                          }
                        }
                      })
                    }
                    onComplete={survey => handleSurveyCompletion(survey.data)} // Manejar la acción al completar
                    renderCompleted={data => {
                      return (
                        <div className='bg-green-100 text-green-800 p-4 rounded-lg'>
                          <p>{t("Thank you for completing the task!")}</p>
                        </div>
                      )
                    }}
                  />
                </div>
              ) : (
                <p className='text-gray-500'>
                  {t(
                    "This task type is not supported. Please contact the administrator."
                  )}
                </p>
              )}
            </>
          ) : (
            <p className='text-gray-500'>
              {t("Task not found. Please contact the administrator.")}
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
