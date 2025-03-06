import { FiMapPin } from "react-icons/fi";
import { LuRouteOff, LuRoute } from "react-icons/lu";
import { TbLassoPolygon } from "react-icons/tb";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { Position, CampaignData } from "./types";
import { useTranslation } from "@/hooks/useTranslation";
import { logEvent } from "@/utils/logger";

interface MapControlsProps {
  position: Position | null;
  showRoute?: boolean;
  isSelectedPoi?: boolean;
  toggleRoute: () => void | null;
  campaignData: CampaignData | null;
}

const MapControls: React.FC<MapControlsProps> = ({
  position,
  showRoute = false,
  isSelectedPoi = false,
  toggleRoute = null,
  campaignData,
}) => {
  const { t } = useTranslation();
  const map = useMap();

  const focusOnCurrentLocation = () => {
    if (position) {
      logEvent(
        "BUTTON_CLICKED_FOCUS_ON_CURRENT_LOCATION_WITH_COORDINATES",
        "User clicked on focus on current location button with coordinates",
        { position }
      );
      map.setView([position.lat, position.lng], 16);
    } else {
      console.warn("Current location is not available.");
    }
  };

  const focusOnCampaign = () => {
    if (campaignData?.areas) {
      const bounds = L.latLngBounds([]);
      campaignData.areas.forEach((area: any) => {
        area.polygon.forEach(([lat, lng]: [number, number]) => {
          bounds.extend([lat, lng]);
        });
      });
      map.fitBounds(bounds);
      logEvent(
        "BUTTON_CLICKED_FOCUS_ON_CAMPAIGN_AREA",
        "User clicked on focus on campaign area button",
        { campaignData, bounds }
      );
    } else {
      console.warn("Campaign data is not available.");
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-99999 flex flex-col gap-2">
      {isSelectedPoi && (
        <>
          {showRoute ? (
            <button
              onClick={toggleRoute}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md focus:outline-none"
              title={t("Remove route")}
            >
              <LuRouteOff size={24} />
            </button>
          ) : (
            <button
              onClick={toggleRoute}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md focus:outline-none"
              title={t("Show route")}
            >
              <LuRoute size={24} />
            </button>
          )}
        </>
      )}
      <button
        onClick={focusOnCampaign}
        className={`p-3 ${
          campaignData?.areas
            ? "bg-teal-500 hover:bg-teal-600"
            : "bg-gray-300"
        } text-white rounded-full shadow-md focus:outline-none`}
        title={t("Focus on campaign area")}
        data-cy="focus-on-campaign"
        disabled={!campaignData?.areas}
      >
        <TbLassoPolygon size={24} />
      </button>
      <button
        onClick={focusOnCurrentLocation}
        className={`p-3 ${
          position ? "bg-indigo-500 hover:bg-indigo-600" : "bg-gray-300"
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
  );
};

export default MapControls;
