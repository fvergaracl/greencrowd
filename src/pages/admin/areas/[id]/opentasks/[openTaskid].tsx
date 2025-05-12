import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Survey, Model } from "survey-react-ui"
import { MdOutlineAssignment } from "react-icons/md"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
import DefaultLayout from "@/components/AdminLayout"
import { getApiBaseUrl } from "@/config/api"
import { useTranslation } from "@/hooks/useTranslation"

interface OpenTaskDetails {
  id: string
  title: string
  description: string | null
  type: string
  isDisabled: boolean
  taskData: Record<string, any>
  area: {
    id: string
    name: string
    campaign: {
      id: string
      name: string
    }
  }
  allowedRadius: number
  availableFrom: string | null
  availableTo: string | null
  createdAt: string
  updatedAt: string
}

export default function AreaOpenTaskDetailsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { id: areaId, openTaskid } = router.query
  const [task, setTask] = useState<OpenTaskDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!areaId || !openTaskid) return

    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(
          `${getApiBaseUrl()}/admin/areas/${areaId}/opentasks/${openTaskid}`
        )
        setTask(response.data)
      } catch (err) {
        console.error("Failed to fetch open task details:", err)
        setError(t("Failed to load task details"))
      } finally {
        setLoading(false)
      }
    }

    fetchTaskDetails()
  }, [areaId, openTaskid])

  const handleEdit = () => {
    if (task) {
      router.push(`/admin/areas/${areaId}/opentasks/${task.id}/edit`)
    }
  }

  if (loading) return <div>{t("Loading...")}</div>
  if (error) return <div className='text-red-500'>{error}</div>
  if (!task) return <div>{t("No task found")}.</div>

  const surveyModel = new Model(task.taskData)

  return (
    <DefaultLayout>
      <Breadcrumb
        icon={<MdOutlineAssignment />}
        pageName={task.title}
        breadcrumbPath={`Areas / ${task.area.name} / Open Tasks / ${task.title}`}
      />

      <div className='overflow-x-auto rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark'>
        <h1 className='text-2xl font-bold text-gray-800 dark:text-white mb-4'>
          {t("Open Task Details")}
        </h1>

        <div className='space-y-4'>
          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Title")}:
            </strong>
            <p className='text-gray-800 dark:text-white'>{task.title}</p>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Description")}:
            </strong>
            <p className='text-gray-800 dark:text-white'>
              {task.description || "N/A"}
            </p>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Type")}:
            </strong>
            <p className='text-gray-800 dark:text-white'>{task.type}</p>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Allowed Radius")}:
            </strong>
            <p className='text-gray-800 dark:text-white'>
              {task.allowedRadius} m
            </p>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Area")}:
            </strong>
            <p className='text-gray-800 dark:text-white'>{task.area.name}</p>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Campaign")}:
            </strong>
            <p className='text-gray-800 dark:text-white'>
              {task.area.campaign.name}
            </p>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Status")}:
            </strong>
            <span
              className={`px-2 py-1 text-sm font-medium rounded ${
                task.isDisabled
                  ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
                  : "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
              }`}
            >
              {task.isDisabled ? t("Disabled") : t("Active")}
            </span>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Available From")}:
            </strong>
            <p className='text-gray-800 dark:text-white'>
              {task.availableFrom
                ? new Date(task.availableFrom).toLocaleString()
                : t("Not defined")}
            </p>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Available To")}:
            </strong>
            <p className='text-gray-800 dark:text-white'>
              {task.availableTo
                ? new Date(task.availableTo).toLocaleString()
                : t("Not defined")}
            </p>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Task Preview")}:
            </strong>
            <div className='border border-gray-300 rounded p-4 bg-gray-50 dark:bg-gray-800'>
              <Survey model={surveyModel} />
              <p className='text-sm text-gray-500 mt-2'>
                {t("This is a preview of the task form")}.
              </p>
            </div>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Created At")}:
            </strong>
            <p className='text-gray-800 dark:text-white'>
              {new Date(task.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <strong className='text-gray-700 dark:text-gray-300'>
              {t("Updated At")}:
            </strong>
            <p className='text-gray-800 dark:text-white'>
              {new Date(task.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className='mt-6 flex gap-4'>
          <button
            onClick={handleEdit}
            className='px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600'
          >
            {t("Edit Open Task")}
          </button>
        </div>
      </div>
    </DefaultLayout>
  )
}
