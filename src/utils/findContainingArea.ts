import booleanPointInPolygon from "@turf/boolean-point-in-polygon"
import { point, polygon } from "@turf/helpers"
const findContainingArea = (
  campaignData: any,
  position: { lat: number; lng: number }
) => {
  const pt = point([position?.lng, position?.lat])

  for (const area of campaignData?.areas) {
    if (!area?.polygon || area?.polygon?.length < 3) continue

    const poly = polygon([
      [
        ...area?.polygon?.map(([lat, lng]) => [lng, lat]),
        area?.polygon[0].slice().reverse()
      ]
    ])

    if (booleanPointInPolygon(pt, poly)) {
      return area
    }
  }

  return null
}

export default findContainingArea
