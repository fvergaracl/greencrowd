// pages/dashboard/questionnaires/[id].tsx
import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import { SurveyModel } from "survey-core"
import { Survey } from "survey-react-ui"
import DashboardLayout from "@/components/DashboardLayout"
import { useTranslation } from "@/hooks/useTranslation"
import { useDashboard } from "@/context/DashboardContext"
import GoBack from "@/components/Admin/GoBack"
import Swal from "sweetalert2"
import Lottie from "lottie-react"
import downloading_task from "@/lotties/downloading_task.json"
import points_reward from "@/lotties/points_reward.json"
import sent_without_gamification from "@/lotties/sent_without_gamification.json"
import "survey-core/defaultV2.min.css"

export default function QuestionnairePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const { selectedCampaign } = useDashboard()
  const [questionnaire, setQuestionnaire] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [responseSent, setResponseSent] = useState(false)
  const [pointsEarned, setPointsEarned] = useState<number | null>(null)

  const formRef = useRef<SurveyModel | null>(null)

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!id) return
      try {
        const res = await fetch(`/api/questionnaires/${id}`)
        if (!res.ok) throw new Error("Unauthorized or not found")

        const data = await res.json()
        setQuestionnaire(data.questionnaire)
      } catch (error) {
        console.error("Error loading questionnaire:", error)
        Swal.fire(
          t("Access Denied"),
          t("You do not have access to this questionnaire."),
          "error"
        ).then(() => router.replace("/dashboard"))
      } finally {
        setLoading(false)
      }
    }

    fetchQuestionnaire()
  }, [id])

  useEffect(() => {
    if (questionnaire?.questionnaireData && !formRef.current) {
      const model = new SurveyModel({
        ...questionnaire.questionnaireData,
        completeText: t("Submit"),
        showCompletedPage: false
      })

      model.onComplete.add(async sender => {
        await handleComplete(sender)
      })

      formRef.current = model
    }
  }, [questionnaire, t])

  const handleComplete = async (survey: SurveyModel) => {
    const { id } = router.query

    if (typeof id !== "string") {
      Swal.fire("Error", "Invalid questionnaire ID", "error")
      return
    }

    try {
      const response = await fetch(`/api/questionnaires/${id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          questionnaireResponse: survey.data
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit questionnaire")
      }

      setResponseSent(true)
      setPointsEarned(null)

      await Swal.fire(
        t("Success!"),
        t("Questionnaire submitted successfully!"),
        "success"
      )

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error submitting questionnaire:", error)
      Swal.fire("Error", error.message || "Unknown error", "error")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className='h-screen flex flex-col items-center justify-center p-4'>
          <Lottie
            animationData={downloading_task}
            className='w-full max-w-md'
          />
          <h1 className='text-gray-600 text-lg font-medium'>
            {t("Loading questionnaire...")}
          </h1>
        </div>
      </DashboardLayout>
    )
  }

  if (responseSent) {
    return (
      <DashboardLayout>
        <div className='h-screen flex flex-col items-center justify-center p-4 text-center'>
          <div className='bg-white shadow-md rounded-lg p-6'>
            <Lottie
              animationData={
                pointsEarned ? points_reward : sent_without_gamification
              }
              loop={false}
              className='w-full max-w-md'
            />
            <h1 className='text-xl font-semibold text-gray-700 mb-2'>
              {t("Questionnaire submitted successfully!")}
            </h1>
            {pointsEarned && (
              <p className='text-lg'>
                {t("You earned")}{" "}
                <strong className='text-green-600 underline'>
                  {pointsEarned}
                </strong>{" "}
                {t("points")}
              </p>
            )}
            <GoBack className='text-blue-600 mt-4' />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className='max-w-3xl mx-auto px-4 py-6 bg-white shadow-md rounded-lg mt-4'>
        <GoBack className='text-blue-600 mb-4' />
        <h1 className='text-2xl font-bold text-gray-800 mb-2'>
          {questionnaire.title}
        </h1>

        {formRef.current ? (
          <Survey model={formRef.current} />
        ) : (
          <p className='text-gray-500'>{t("Invalid questionnaire data.")}</p>
        )}
      </div>
    </DashboardLayout>
  )
}
