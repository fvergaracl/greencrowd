"use client";
import { useTranslation } from "@/hooks/useTranslation";
import dynamic from "next/dynamic";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { logEvent } from "@/utils/logger";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

import L from "leaflet";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src,
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
  });
}

interface ResponseLocationMapProps {
  latitude: number;
  longitude: number;
}

const ResponseLocationMap: React.FC<ResponseLocationMapProps> = ({
  latitude,
  longitude,
}) => {
  const { t } = useTranslation();
  const center = [latitude, longitude] as [number, number];

  return (
    <div className="h-72 w-full rounded-xl overflow-hidden shadow border border-gray-200">
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker
          position={center}
          eventHandlers={{
            click: () => {
              logEvent(
                "CLICKED_RESPONSE_LOCATION_ON_RESPONSE_LOCATION_MAP",
                "User clicked on response location on response location map",
                { latitude, longitude }
              );
            },
          }}
        >
          <Popup>
            📍 <strong>{t("Response Location")}</strong>
            <br />
            Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ResponseLocationMap;
