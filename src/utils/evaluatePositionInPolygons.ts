import { point, polygon, lineString } from "@turf/helpers"
import booleanPointInPolygon from "@turf/boolean-point-in-polygon"
import distance from "@turf/distance"
import nearestPointOnLine from "@turf/nearest-point-on-line"

interface Position {
  lat: number
  lng: number
}

interface Result {
  isInsideAnyPolygon: boolean
  closestPolygonIndex: number | null
  distanceToClosestPolygon: number | null
}

export function evaluatePositionInPolygons(
  position: Position,
  polygons: [number, number][][]
): Result {
  const userPoint = point([position.lng, position.lat])
  let isInsideAnyPolygon = false
  let closestPolygonIndex: number | null = null
  let minDistance = Infinity

  polygons.forEach((poly, index) => {
    if (poly.length < 3) return

    // Convertimos a [lng, lat] para Turf
    const turfCoords = poly.map(([lat, lng]) => [lng, lat])

    // Cerramos el polígono si no está cerrado
    const isClosed =
      turfCoords[0][0] === turfCoords[turfCoords.length - 1][0] &&
      turfCoords[0][1] === turfCoords[turfCoords.length - 1][1]

    if (!isClosed) turfCoords.push(turfCoords[0])

    const turfPolygon = polygon([turfCoords])
    const turfLine = lineString(turfCoords)

    if (booleanPointInPolygon(userPoint, turfPolygon)) {
      isInsideAnyPolygon = true
      closestPolygonIndex = index
      minDistance = 0
    } else {
      const nearest = nearestPointOnLine(turfLine, userPoint)
      const dist = distance(userPoint, nearest, { units: "meters" })
      if (dist < minDistance) {
        minDistance = dist
        closestPolygonIndex = index
      }
    }
  })

  return {
    isInsideAnyPolygon,
    closestPolygonIndex,
    distanceToClosestPolygon: Number.isFinite(minDistance) ? minDistance : null
  }
}
