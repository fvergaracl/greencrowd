import { useRouter } from "next/router"
import DefaultLayout from "@/components/AdminLayout"
import dynamic from "next/dynamic"
import { useTranslation } from "@/hooks/useTranslation"
const QuestionnaireForm = dynamic(
  () => import("@/components/AdminLayout/QuestionnaireForm"),
  { ssr: false }
)
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
export default function CreateAreaPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id, questonnarieid } = router.query

  return (
    <DefaultLayout>
      <Breadcrumb
        pageName={t("Edit Questionnaire")}
        breadcrumbPath={t("Questionnaire / Edit")}
      />
      {questonnarieid ? (
        <QuestionnaireForm
          mode='edit'
          campaignId={id as string}
          questionnaireId={questonnarieid as string}
        />
      ) : (
        <p>{t("Loading...")}</p>
      )}
    </DefaultLayout>
  )
}
