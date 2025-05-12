// PENDING
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { getApiBaseUrl } from "@/config/api"
import axios from "axios"
import { useTranslation } from "@/hooks/useTranslation"
import { SurveyModel } from "survey-core"
import { Survey } from "survey-react-ui"
import "survey-core/defaultV2.min.css" // Estilo por defecto SurveyJS
import dynamic from "next/dynamic"
import GoBack from "@/components/Admin/GoBack"

const ResponseLocationMap = dynamic(
  () => import("@/components/ResponseLocationMap"),
  { ssr: false }
)

export default function TaskResponseDetail() {
  const router = useRouter()
  const { id, responseId } = router.query
  const { t } = useTranslation()

  const [responseDetail, setResponseDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResponseDetail = async () => {
      if (!id || !responseId) return
      try {
        const res = await axios.get(
          `${getApiBaseUrl()}/task/${id}/response/${responseId}`
        )

        setResponseDetail(res.data)
      } catch (err) {
        console.error("Error fetching response:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchResponseDetail()
  }, [id, responseId])

  return (
    <DashboardLayout>
      <div className='max-w-3xl mx-auto p-6'>
        <GoBack
          data-cy='go-back-link-from-response-detail'
          className='text-blue-600 cursor-pointer mb-4 inline-block text-xl font-bold'
          event={{
            eventType: "GO_BACK_FROM_RESPONSE_DETAIL",
            description: "User clicked go back from response detail",
            metadata: { taskId: id, responseId }
          }}
        />
        <h1 className='text-2xl font-bold text-black-700 mb-4 text-center'>
          {t("Submission Details")}
        </h1>

        {loading ? (
          <p className='text-gray-500'>{t("Loading...")}</p>
        ) : !responseDetail ? (
          <p className='text-red-500'>{t("Response not found")}</p>
        ) : (
          <div className='bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-6'>
            <div className='text-sm text-gray-600'>
              <strong>{t("id")}:</strong> {responseDetail.response?.id}
            </div>

            <div className='text-sm text-gray-600'>
              <strong>{t("Created at")}:</strong>{" "}
              {new Date(responseDetail.response?.createdAt).toLocaleString()}
            </div>

            <div className='text-gray-700 text-sm'>
              <strong>{t("Task Title")}:</strong>{" "}
              {responseDetail.task?.title || "-"}
            </div>

            <div className='text-gray-700 text-sm'>
              <strong>{t("Task Description")}:</strong>{" "}
              {responseDetail.task?.description || "-"}
            </div>

            {responseDetail?.response?.latitude &&
              responseDetail?.response?.longitude && (
                <div>
                  <h3 className='text-md font-semibold text-blue-600 mb-2'>
                    {t("Response Location")}
                  </h3>
                  <ResponseLocationMap
                    latitude={responseDetail.response.latitude}
                    longitude={responseDetail.response.longitude}
                  />
                </div>
              )}

            {responseDetail.task?.taskData ? (
              <div className='pt-4'>
                <h1 className='text-2xl font-bold text-black-700 mb-4 text-center text-underlined'>
                  {t("Response")}
                </h1>
                <Survey
                  model={(() => {
                    const survey = new SurveyModel(responseDetail.task.taskData)
                    survey.data = responseDetail.response?.data || {}
                    survey.mode = "display"
                    return survey
                  })()}
                />
              </div>
            ) : (
              <div className='text-gray-500 text-sm italic'>
                {t("This task has no associated form")}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
