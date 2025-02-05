import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
import DefaultLayout from "@/components/AdminLayout"
import { useTranslation } from "@/hooks/useTranslation"

const AreaForm = dynamic(() => import("@/components/AdminLayout/AreaForm"), {
  ssr: false
})

export default function EditAreaPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query

  return (
    <DefaultLayout>
      <Breadcrumb
        pageName={id ? `${t("Edit Area")} ${id}` : t("Edit Area")}
        breadcrumbPath={t("Area / Edit")}
      />
      {id ? <AreaForm areaId={id as string} /> : <p>{t("Loading...")}</p>}
    </DefaultLayout>
  )
}
