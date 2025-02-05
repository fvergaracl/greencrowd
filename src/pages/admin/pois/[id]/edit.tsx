import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import DefaultLayout from "@/components/AdminLayout"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
import { useTranslation } from "@/hooks/useTranslation"
const PoisForm = dynamic(() => import("@/components/AdminLayout/PoisForm"), {
  ssr: false
})

export default function EditAreaPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { id } = router.query

  return (
    <DefaultLayout>
      <Breadcrumb
        pageName={id ? `Edit POI ${id}` : "Edit POI"}
        breadcrumbPath='POI / Edit'
      />
      {id ? <PoisForm poiId={id as string} /> : <p>Loading...</p>}
    </DefaultLayout>
  )
}
