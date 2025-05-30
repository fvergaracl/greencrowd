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
  const { id } = router.query

  return (
    <DefaultLayout>
      <Breadcrumb
        pageName={t("Create Questionnaire")}
        breadcrumbPath={t("Questionnaire / Create")}
      />
      <QuestionnaireForm mode='create' campaignId={id as string} />
    </DefaultLayout>
  )
}
