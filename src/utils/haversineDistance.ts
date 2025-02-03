/**
 * Calculates the Haversine distance between two geographic points in meters.
 *
 * @param lat1 - Latitude of the first point in decimal degrees.
 * @param lng1 - Longitude of the first point in decimal degrees.
 * @param lat2 - Latitude of the second point in decimal degrees.
 * @param lng2 - Longitude of the second point in decimal degrees.
 * @returns The distance between the two points in meters.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const EARTH_RADIUS_METERS = 6371000 // Earth's radius in meters
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

  const deltaLat = toRadians(lat2 - lat1)
  const deltaLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c
}
