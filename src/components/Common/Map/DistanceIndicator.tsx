import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "@/hooks/useTranslation"

interface IDistanceToPoi {
  kilometters: number
  metters: number
}

interface Position {
  lat: number
  lng: number
}

interface POI {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
}

interface DistanceIndicatorProps {
  poi: POI
  position: Position
  onRadiusChange?: (isInside: boolean) => void
}

const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): IDistanceToPoi => {
  const toRad = (value: number) => (value * Math.PI) / 180

  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanceKm = R * c
  const distanceM = Math.round(distanceKm * 1000)

  return {
    kilometters: Math.floor(distanceKm),
    metters: distanceM % 1000
  }
}

const DistanceIndicator: React.FC<DistanceIndicatorProps> = ({
  poi,
  position,
  onRadiusChange
}) => {
  const [isInsideRadius, setIsInsideRadius] = useState<boolean>(false)
  const [colorText, setColorText] = useState<string>("text-gray-700")
  const { t } = useTranslation()

  const distanceToPoi = useMemo(
    () =>
      calculateDistance(
        position.lat,
        position.lng,
        poi.latitude,
        poi.longitude
      ),
    [poi, position]
  )

  useEffect(() => {
    const totalMeters = distanceToPoi.kilometters * 1000 + distanceToPoi.metters
    const currentlyInside = totalMeters <= poi.radius

    if (currentlyInside !== isInsideRadius) {
      setIsInsideRadius(currentlyInside)
      if (onRadiusChange) {
        onRadiusChange(currentlyInside)
      }
    }

    if (totalMeters <= poi.radius) {
      setColorText("text-green-600")
    } else {
      setColorText("text-blue-600")
    }
  }, [distanceToPoi, poi.radius, isInsideRadius, onRadiusChange])

  let messageDistance = t("Calculating distance...")

  if (distanceToPoi.kilometters !== null) {
    const totalMeters = distanceToPoi.kilometters * 1000 + distanceToPoi.metters

    if (totalMeters <= poi.radius) {
      messageDistance = t("You are within the point of interest radius")
    } else if (distanceToPoi.kilometters === 0 && distanceToPoi.metters === 0) {
      messageDistance = t("You are in the point of interest")
    } else if (distanceToPoi.kilometters === 0) {
      messageDistance = t(
        "You are {{meters}} m away from the point of interest",
        { meters: distanceToPoi.metters }
      )
    } else if (distanceToPoi.metters === 0) {
      messageDistance = t(
        "You are {{kilometers}} km away from the point of interest",
        { kilometers: distanceToPoi.kilometters }
      )
    } else {
      messageDistance = t(
        "You are {{kilometers}} km and {{meters}} m away from the point of interest",
        { kilometers: distanceToPoi.kilometters, meters: distanceToPoi.metters }
      )
    }
  }

  return (
    <div
      className='absolute z-500 mx-auto top-0 left-0 right-0 bg-white dark:bg-green-500 shadow-lg rounded-b-lg p-3 text-center'
      style={{
        zIndex: 500
      }}
    >
      <p className={`${colorText} font-semibold`}>{messageDistance}</p>
    </div>
  )
}

export default DistanceIndicator
