import { useRouter } from "next/router"
import DefaultLayout from "@/components/AdminLayout"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
import { useTranslation } from "@/hooks/useTranslation"
import dynamic from "next/dynamic"
const AreaOpenTaskForm = dynamic(
  () => import("@/components/AdminLayout/AreaOpenTaskForm"),
  {
    ssr: false
  }
)

export default function CreateAreaPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query

  return (
    <DefaultLayout>
      <Breadcrumb
        pageName={t("Create an Open Task")}
        breadcrumbPath={t("Area / Open Task / Create")}
      />
      <AreaOpenTaskForm areaId={id} />
    </DefaultLayout>
  )
}
