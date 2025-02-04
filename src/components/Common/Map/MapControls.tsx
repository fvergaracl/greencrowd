import { FiMapPin } from "react-icons/fi"
import { LuRouteOff } from "react-icons/lu"
import { TbLassoPolygon } from "react-icons/tb"
import L from "leaflet"
import { useMap } from "react-leaflet"
import { Position, CampaignData } from "./types"
import { useTranslation } from "@/hooks/useTranslation"

interface MapControlsProps {
  position: Position | null
  removeRoute: () => void | null
  campaignData: CampaignData | null
}

const MapControls: React.FC<MapControlsProps> = ({
  position,
  removeRoute = null,
  campaignData
}) => {
  const { t } = useTranslation()
  const map = useMap()

  const focusOnCurrentLocation = () => {
    if (position) {
      map.setView([position.lat, position.lng], 16)
    } else {
    }
  }

  const focusOnCampaign = () => {
    if (campaignData?.areas) {
      const bounds = L.latLngBounds([])
      campaignData.areas.forEach((area: any) => {
        area.polygon.forEach(([lat, lng]: [number, number]) => {
          bounds.extend([lat, lng])
        })
      })
      map.fitBounds(bounds)
      console.log("Focusing on campaign area.")
    } else {
      console.warn("Campaign data is not available.")
    }
  }

  return (
    <div className='absolute bottom-4 right-4 z-99999 flex flex-col gap-2'>
      {removeRoute && (
        <button
          onClick={removeRoute}
          className='p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md focus:outline-none'
          title={t("Remove route")}
        >
          <LuRouteOff size={24} />
        </button>
      )}
      <button
        onClick={focusOnCampaign}
        className={`p-3 ${
          campaignData?.areas
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gray-300"
        } text-white rounded-full shadow-md focus:outline-none`}
        title={t("Focus on campaign area")}
        disabled={!campaignData?.areas}
      >
        <TbLassoPolygon size={24} />
      </button>
      <button
        onClick={focusOnCurrentLocation}
        className={`p-3 ${
          position ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300"
        } text-white rounded-full shadow-md focus:outline-none`}
        title={
          position
            ? `${t("Focus on current location")}: ${position.lat}, ${position.lng}`
            : t("Current location is not available")
        }
        disabled={!position}
      >
        <FiMapPin size={24} />
      </button>
    </div>
  )
}

export default MapControls
