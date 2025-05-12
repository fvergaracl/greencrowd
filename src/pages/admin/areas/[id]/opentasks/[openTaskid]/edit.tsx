import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import DefaultLayout from "@/components/AdminLayout"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
import { useTranslation } from "@/hooks/useTranslation"
import dynamic from "next/dynamic"
import { getApiBaseUrl } from "@/config/api"
import axios from "axios"

const AreaOpenTaskForm = dynamic(
  () => import("@/components/AdminLayout/AreaOpenTaskForm"),
  { ssr: false }
)

interface SurveyElement {
  name: string
  type: string
  title: string
}

interface SurveyPage {
  name: string
  elements: SurveyElement[]
}

interface TaskData {
  pages: SurveyPage[]
}

interface Campaign {
  id: string
  name: string
}

interface Area {
  id: string
  name: string
  campaign: Campaign
}

interface OpenTask {
  id: string
  title: string
  description: string
  type: "Form" | "Instruction" | "Data collection"
  taskData: TaskData
  availableFrom: string | null
  availableTo: string | null
  isDisabled: boolean
  area: Area
  createdAt: string
  updatedAt: string
}

interface InitialData {
  title: string
  description: string
  type: "Form" | "Instruction" | "Data collection"
  surveyJSON: TaskData
  availableFrom?: string | null
  availableTo?: string | null
  isDisabled?: boolean
}

export default function EditOpenTaskPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id, openTaskid } = router.query as {
    id: string
    openTaskid: string
  }

  const [initialData, setInitialData] = useState<InitialData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !openTaskid) return

    const fetchOpenTask = async () => {
      try {
        const { data }: { data: OpenTask } = await axios.get(
          `${getApiBaseUrl()}/admin/areas/${id}/opentasks/${openTaskid}`
        )
        setInitialData({
          title: data.title,
          description: data.description,
          type: data.type,
          surveyJSON: data.taskData,
          availableFrom: data.availableFrom,
          availableTo: data.availableTo,
          isDisabled: data.isDisabled
        })
      } catch (error) {
        console.error("Failed to fetch open task details", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOpenTask()
  }, [id, openTaskid])

  if (loading) return <div>{t("Loading...")}</div>

  if (!initialData) {
    return (
      <div>{t("Open task not found. Please contact the administrator.")}</div>
    )
  }

  return (
    <DefaultLayout>
      <Breadcrumb
        pageName={`${t("Edit Open Task in Area")}: ${initialData.title}`}
        breadcrumbPath={`${t("Areas")} / ${t("Open Tasks")} / ${t("Edit")}`}
      />
      <AreaOpenTaskForm
        areaId={id}
        openTaskId={openTaskid}
        initialData={initialData}
        mode='edit'
      />
    </DefaultLayout>
  )
}
