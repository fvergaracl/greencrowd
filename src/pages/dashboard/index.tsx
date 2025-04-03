import DashboardLayout from "@/components/DashboardLayout"
import dynamic from "next/dynamic"
import { useDashboard } from "@/context/DashboardContext"
import CampaignsScreen from "@/screens/CampaignsScreen"
import { useTranslation } from "@/hooks/useTranslation"
import Lottie from "lottie-react"
import MapLocationNeeded from "@/lotties/map_location_needed.json"

const Map = dynamic(() => import("@/components/Common/Map"), {
  ssr: false
})
export default function Dashboard() {
  const { t } = useTranslation()
  const { selectedCampaign, isTracking } = useDashboard()
 

  if (!selectedCampaign) {
    return (
      <DashboardLayout>
        <CampaignsScreen />
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout>
      {!isTracking ? (
        <div
          className='min-h-screen flex flex-col justify-center items-center'
          data-cy='map-container-for-dashboard'
        >
          <div className='flex justify-center'>
            <Lottie
              animationData={MapLocationNeeded}
              loop={true}
              className='max-w-[300px] w-full'
            />
          </div>
          <h2 className='text-center text-2xl'>
            {t("Please enable location services to see the map")}
          </h2>
        </div>
      ) : (
        <Map
          showMyLocation={true}
          points={[]}
          polygons={[]}
          polygonsMultiColors={false}
          polygonsTitle={false}
          selectedCampaign={selectedCampaign}
          showMapControl={true}
        />
      )}
    </DashboardLayout>
  )
}


