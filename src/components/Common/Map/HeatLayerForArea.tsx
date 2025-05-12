import { useEffect, useMemo, useRef } from "react"
import L from "leaflet"
import { useMap } from "react-leaflet"
import booleanPointInPolygon from "@turf/boolean-point-in-polygon"
import { point, polygon } from "@turf/helpers"

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
  totalResponses: number
  position: LatLng
  onIndexCalculated?: (areaId: string, index: number, isInside: boolean) => void
}

export const HeatLayerForArea = ({
  area,
  totalResponses,
  position,
  onIndexCalculated
}: HeatLayerForAreaProps) => {
  console.log("0000000000000000000")
  console.log(totalResponses)
  const map = useMap()
  const heatLayerRef = useRef<L.Layer | null>(null)

  const points = useMemo(() => {
    const result: [number, number, number][] = []
    area.openTasks?.forEach(task => {
      task.responses?.forEach(response => {
        if (response.latitude && response.longitude) {
          result.push([response.latitude, response.longitude, 0.8])
        }
      })
    })
    return result
  }, [area])

  const isInside = useMemo(() => {
    try {
      const turfPoint = point([position.lng, position.lat])
      const turfPolygon = polygon([
        [
          ...area.polygon.map(([lat, lng]) => [lng, lat]),
          [area.polygon[0][1], area.polygon[0][0]]
        ]
      ]) // cierre
      return booleanPointInPolygon(turfPoint, turfPolygon)
    } catch {
      return false
    }
  }, [area.polygon, position])

  const explorationIndex = useMemo(() => {
    const localResponses = points.length
    if (totalResponses === 0) return 10

    let index = Math.round((1 - localResponses / totalResponses) * 10)

    // Bonus si estás dentro del área
    if (isInside) index = Math.max(0, index - 2)

    if (onIndexCalculated) {
      onIndexCalculated(area.id, index, isInside)
    }

    return index
  }, [points, totalResponses, area.id, isInside, onIndexCalculated])

  useEffect(() => {
    if (points.length === 0) return

    const zoom = map.getZoom()
    const radius = getRadiusForZoom(zoom)

    heatLayerRef.current = (L as any)
      .heatLayer(points, {
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
      .addTo(map)

    const handleZoom = () => {
      const newZoom = map.getZoom()
      const newRadius = getRadiusForZoom(newZoom)

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
        heatLayerRef.current = (L as any)
          .heatLayer(points, {
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
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current)
    }
  }, [points, map])

  useEffect(() => {
    const localResponses = points.length
    if (totalResponses === 0) return

    let index = Math.round((1 - localResponses / totalResponses) * 10)
    if (isInside) index = Math.max(0, index - 2)

    if (onIndexCalculated) {
      onIndexCalculated(area.id, index, isInside)
    }
  }, [points, totalResponses, area.id, isInside, onIndexCalculated])

  return null
}

const getRadiusForZoom = (zoom: number): number => {
  const base = 25
  const scaleFactor = 1.5 ** (13 - zoom)
  return Math.max(15, base * scaleFactor)
}
