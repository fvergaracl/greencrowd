import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import Swal from "sweetalert2"
import "survey-core/defaultV2.min.css"
import "survey-creator-core/survey-creator-core.min.css"
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react"
import GoBack from "@/components/Admin/GoBack"
import { useTranslation } from "@/hooks/useTranslation"
import { getApiBaseUrl } from "@/config/api"

interface QuestionnaireFormProps {
  mode: "create" | "edit"
  campaignId?: string
  questionnaireId?: string
  initialData?: {
    title: string
    condition: "BEFORE" | "AFTER" | "DAILY" | "EVERY_X_DAYS"
    frequencyInDays?: number
    questionnaireData: any
  }
}

const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({
  mode,
  campaignId,
  questionnaireId,
  initialData
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || "")
  const [condition, setCondition] = useState(initialData?.condition || "BEFORE")
  const [frequencyInDays, setFrequencyInDays] = useState<number | null>(
    initialData?.frequencyInDays || null
  )
  const [saving, setSaving] = useState(false)

  const [creator] = useState(() => {
    const newCreator = new SurveyCreator({ isAutoSave: true })
    return newCreator
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!questionnaireId) return

      try {
        setSaving(true)
        const res = await axios.get(
          `${getApiBaseUrl()}/admin/questionnaires/${questionnaireId}`
        )
        const q = res.data
        setTitle(q.title || "")
        setCondition(q.condition || "BEFORE")
        setFrequencyInDays(q.frequencyInDays || null)
        if (q.questionnaireData) {
          creator.JSON = q.questionnaireData
        }
      } catch (err) {
        console.error(err)
        Swal.fire({
          icon: "error",
          title: t("Error"),
          text: t("Failed to load questionnaire")
        })
      } finally {
        setSaving(false)
      }
    }

    fetchData()
  }, [questionnaireId, creator, t])

  useEffect(() => {
    if (initialData?.questionnaireData) {
      creator.JSON = initialData.questionnaireData
    }
  }, [initialData, creator])

  const handleSave = useCallback(async () => {
    if (!title || !condition) {
      Swal.fire({
        icon: "error",
        title: t("Missing Fields"),
        text: t("Title and condition are required")
      })
      return
    }
    if (
      condition === "EVERY_X_DAYS" &&
      (!frequencyInDays || frequencyInDays < 1)
    ) {
      Swal.fire({
        icon: "error",
        title: t("Invalid Frequency"),
        text: t("Frequency must be a positive number")
      })
      return
    }
    if (!campaignId) {
      Swal.fire({
        icon: "error",
        title: t("Missing Campaign"),
        text: t("A campaign ID is required")
      })
      return
    }
    if (!creator.JSON || Object.keys(creator.JSON).length === 0) {
      Swal.fire({
        icon: "error",
        title: t("Empty Questionnaire"),
        text: t("Please design a questionnaire before saving")
      })
      return
    }

    const payload = {
      campaignId,
      title,
      condition,
      frequencyInDays: condition === "EVERY_X_DAYS" ? frequencyInDays : null,
      questionnaireData: creator.JSON
    }

    try {
      const url = questionnaireId
        ? `${getApiBaseUrl()}/admin/questionnaires/${questionnaireId}`
        : `${getApiBaseUrl()}/admin/questionnaires`
      const method = questionnaireId ? axios.put : axios.post
      await method(url, payload)
      Swal.fire({
        icon: "success",
        title:
          mode === "create"
            ? t("Questionnaire Created")
            : t("Questionnaire Updated"),
        text:
          mode === "create"
            ? t("Created successfully")
            : t("Updated successfully")
      })
      router.push(`/admin/campaigns/${campaignId}`)
    } catch (err) {
      console.error(err)
      Swal.fire({
        icon: "error",
        title: t("Error"),
        text: t("Failed to save the questionnaire")
      })
    } finally {
      setSaving(false)
    }
  }, [
    campaignId,
    condition,
    creator,
    frequencyInDays,
    questionnaireId,
    router,
    t,
    title,
    mode
  ])

  return (
    <div className='max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow'>
      <GoBack />
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          {t("Title")} <span className='text-red-500'>*</span>
        </label>
        <input
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          className='w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white'
        />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          {t("Condition")} <span className='text-red-500'>*</span>
        </label>
        <select
          value={condition}
          onChange={e => setCondition(e.target.value as any)}
          className='w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white'
        >
          <option value='BEFORE'>{t("BEFORE")}</option>
          <option value='AFTER'>{t("AFTER")}</option>
          <option value='DAILY'>{t("DAILY")}</option>
          <option value='EVERY_X_DAYS'>{t("EVERY_X_DAYS")}</option>
        </select>
      </div>
      {condition === "EVERY_X_DAYS" && (
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            {t("Frequency (in days)")}
          </label>
          <input
            type='number'
            value={frequencyInDays || ""}
            onChange={e => setFrequencyInDays(parseInt(e.target.value))}
            className='w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white'
          />
        </div>
      )}
      <div className='mb-6'>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          {t("Use the builder below to design your questionnaire")}
        </p>
        <SurveyCreatorComponent creator={creator} />
      </div>
      <div className='flex justify-end'>
        <button
          type='button'
          onClick={handleSave}
          disabled={saving}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {saving
            ? t("Saving...")
            : mode === "create"
              ? t("Create")
              : t("Update")}
        </button>
      </div>
    </div>
  )
}

export default QuestionnaireForm
