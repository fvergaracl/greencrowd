import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useMap } from "react-leaflet"
import { useTranslation } from "@/hooks/useTranslation"

interface KmlPreviewMapProps {
  polygons: [number, number][][]
  selectedIndex?: number
  colors?: string[]
  onSelect?: (index: number) => void
  onDelete?: (index: number) => void
}

const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then(mod => mod.TileLayer),
  { ssr: false }
)
const Polygon = dynamic(
  () => import("react-leaflet").then(mod => mod.Polygon),
  { ssr: false }
)
const FeatureGroup = dynamic(
  () => import("react-leaflet").then(mod => mod.FeatureGroup),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import("react-leaflet").then(mod => mod.Tooltip),
  { ssr: false }
)

function FitPolygons({ polygons }: { polygons: [number, number][][] }) {
  const map = useMap()
  useEffect(() => {
    if (polygons.length > 0) {
      const allCoords = polygons.flat()
      const bounds = L.latLngBounds(allCoords.map(([lat, lng]) => [lat, lng]))
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [polygons, map])
  return null
}

export default function KmlPreviewMap({
  polygons,
  selectedIndex,
  colors,
  onSelect,
  onDelete
}: KmlPreviewMapProps) {
  const mapRef = useRef(null)
  const { t } = useTranslation()

  return (
    <div className='relative h-96 w-full rounded shadow'>
      <MapContainer
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FeatureGroup>
          {polygons.map((polygon, i) => {
            const isSelected = i === selectedIndex
            const color = isSelected ? "deepskyblue" : (colors?.[i] ?? "orange")
            const isValid = color === "limegreen"

            return (
              <Polygon
                key={i}
                positions={polygon}
                pathOptions={{
                  color,
                  weight: isSelected ? 3 : 2,
                  fillOpacity: 0.3
                }}
                eventHandlers={{
                  click: () => onSelect?.(i)
                }}
              >
                <Tooltip sticky direction='top'>
                  {isValid
                    ? `${t("Valid Area")} ${i + 1}`
                    : `${t("Incomplete Area")} ${i + 1}`}
                </Tooltip>
              </Polygon>
            )
          })}
        </FeatureGroup>
        <FitPolygons polygons={polygons} />
      </MapContainer>

      {typeof selectedIndex === "number" && onDelete && (
        <button
          className='absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 z-[999]'
          onClick={() => onDelete(selectedIndex)}
        >
          🗑 {t("Delete Area")} {selectedIndex + 1}
        </button>
      )}
    </div>
  )
}
