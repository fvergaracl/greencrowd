import { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import dynamic from "next/dynamic"
import { useDashboard } from "@/context/DashboardContext"
import CampaignsScreen from "@/screens/CampaignsScreen"
import { useRouter } from "next/router"
import { useTranslation } from "@/hooks/useTranslation"

const Map = dynamic(() => import("@/components/Common/Map"), {
  ssr: false
})

export default function Dashboard() {
  const { t } = useTranslation()
  const { position, selectedCampaign } = useDashboard()
  const [puntos, setPuntos] = useState([])
  const [poligonos, setPoligonos] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const router = useRouter()

  const { invite: campaignId } = router.query

  useEffect(() => {
    if (campaignId) {
      console.log("Invite campaign ID:", campaignId)
    }
  }, [campaignId])

  // useEffect(() => {
  //   const socket = new WebSocket("ws://localhost:8080")

  //   socket.onopen = () => {
  //     console.log("Connected to WebSocket server")
  //   }

  //   socket.onmessage = event => {
  //     const data = JSON.parse(event.data)

  //     if (data.puntos) setPuntos(data.puntos)
  //     if (data.poligonos) setPoligonos(data.poligonos)
  //   }

  //   socket.onclose = () => {
  //     console.log("WebSocket connection closed")
  //   }

  //   return () => {
  //     socket.close()
  //   }
  // }, [])

  if (!selectedCampaign) {
    return (
      <DashboardLayout>
        <CampaignsScreen />
      </DashboardLayout>
    )
  }

  console.log("---------positionposition")
  console.log(position)
  return (
    <DashboardLayout>
      {!position ? (
        <Modal isVisible={isModalVisible}>
          <h2>
            {t("We need your location to continue. Please enable location")}
          </h2>
          <p>
            {t(
              "If you are using a desktop computer, please use a mobile device"
            )}
          </p>
        </Modal>
      ) : (
        <Map
          showMyLocation={true}
          points={puntos}
          polygons={poligonos}
          polygonsMultiColors={false}
          polygonsTitle={false}
          selectedCampaign={selectedCampaign}
          showMapControl={true}
        />
      )}
    </DashboardLayout>
  )
}

function Modal({
  isVisible,
  children
}: {
  isVisible: boolean
  children: React.ReactNode
}) {
  if (!isVisible) return null

  return (
    <div className='fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center'>
      <div className='bg-white p-4 rounded shadow'>{children}</div>
    </div>
  )
}
