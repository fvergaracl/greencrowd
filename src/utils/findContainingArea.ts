import booleanPointInPolygon from "@turf/boolean-point-in-polygon"
import { point, polygon } from "@turf/helpers"

interface Position {
  lat: number
  lng: number
}

interface Area {
  id: string
  name: string
  polygon: [number, number][] 
  [key: string]: any
}

interface CampaignData {
  areas?: Area[]
  [key: string]: any
}

/**
 * Finds the area that contains the given position.
 * @param campaignData 
 * @param position 
 * @returns 
 */
const findContainingArea = (
  campaignData: CampaignData | null | undefined,
  position: Position
): Area | null => {
  if (!campaignData || !Array.isArray(campaignData.areas)) return null

  const pt = point([position.lng, position.lat])

  for (const area of campaignData.areas) {
    const coords = area?.polygon

    if (!Array.isArray(coords) || coords.length < 3) continue

    const turfPolygon = polygon([
      [...coords.map(([lat, lng]) => [lng, lat]), [coords[0][1], coords[0][0]]]
    ])

    if (booleanPointInPolygon(pt, turfPolygon)) {
      return area
    }
  }

  return null
}

export default findContainingArea
