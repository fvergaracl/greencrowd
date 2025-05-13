import { useEffect, useMemo, useRef } from "react"
import L from "leaflet"
import { useMap } from "react-leaflet"
import booleanPointInPolygon from "@turf/boolean-point-in-polygon"
import { point, polygon } from "@turf/helpers"
import distance from "@turf/distance"

interface LatLng {
  lat: number
  lng: number
}

interface HeatLayerForAreaProps {
  area: {
    id: string
    polygon: [number, number][]
    openTasks?: {
      responses?: { latitude: number; longitude: number }[]
    }[]
  }
  position: LatLng
  onIndexCalculated?: (areaId: string, index: number, isInside: boolean) => void
}

export const HeatLayerForArea = ({
  area,
  position,
  onIndexCalculated
}: HeatLayerForAreaProps) => {
  const map = useMap()
  const heatLayerRef = useRef<L.Layer | null>(null)

  const turfPolygon = useMemo(() => {
    return polygon([
      [
        ...area.polygon.map(([lat, lng]) => [lng, lat]),
        [area.polygon[0][1], area.polygon[0][0]] // cerrar el polígono
      ]
    ])
  }, [area.polygon])

  const responsePoints = useMemo(() => {
    const result: [number, number, number][] = []
    area.openTasks?.forEach(task => {
      task.responses?.forEach(response => {
        if (response.latitude && response.longitude) {
          result.push([response.latitude, response.longitude, 0.8])
        }
      })
    })
    return result
  }, [area.openTasks])

  // 🔄 Index calculation (only on position change or responsePoints change)
  useEffect(() => {
    if (!onIndexCalculated || !position || !responsePoints.length) return

    const turfPoint = point([position.lng, position.lat])
    const isInside = booleanPointInPolygon(turfPoint, turfPolygon)

    const minDist = Math.min(
      ...responsePoints.map(([lat, lng]) =>
        distance(turfPoint, point([lng, lat]), { units: "meters" })
      )
    )

    const cappedDistance = Math.min(minDist, 100)
    const normalized = 1 - cappedDistance / 100
    const index = (100 * normalized ** 2)

    onIndexCalculated(area.id, index, isInside)
  }, [position, responsePoints, onIndexCalculated, turfPolygon, area.id])

  // 🔥 Heat Layer rendering
  useEffect(() => {
    if (!responsePoints.length) return

    const zoom = map.getZoom()
    const radius = getRadiusForZoom(zoom)

    const newHeatLayer = (L as any).heatLayer(responsePoints, {
      radius,
      blur: 15,
      maxZoom: 17,
      max: 2,
      gradient: {
        0.2: "blue",
        0.4: "lime",
        0.6: "yellow",
        0.8: "orange",
        1.0: "red"
      }
    })

    newHeatLayer.addTo(map)
    heatLayerRef.current = newHeatLayer

    const handleZoom = () => {
      const newZoom = map.getZoom()
      const newRadius = getRadiusForZoom(newZoom)

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
        heatLayerRef.current = (L as any)
          .heatLayer(responsePoints, {
            radius: newRadius,
            blur: 15,
            maxZoom: 17,
            max: 2,
            gradient: {
              0.2: "blue",
              0.4: "lime",
              0.6: "yellow",
              0.8: "orange",
              1.0: "red"
            }
          })
          .addTo(map)
      }
    }

    map.on("zoomend", handleZoom)

    return () => {
      map.off("zoomend", handleZoom)
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
        heatLayerRef.current = null
      }
    }
  }, [responsePoints, map])

  return null
}

const getRadiusForZoom = (zoom: number): number => {
  const base = 25
  const scaleFactor = 1.5 ** (13 - zoom)
  return Math.max(15, base * scaleFactor)
}
