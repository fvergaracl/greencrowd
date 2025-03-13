import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import { useDashboard } from "@/context/DashboardContext"

interface IDistanceToPoi {
  kilometters: number
  metters: number
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
  onRadiusChange
}) => {
  const { position, setDistanceToPoi } = useDashboard()
  const [isInsideRadius, setIsInsideRadius] = useState<boolean>(false)
  const [bgColor, setBgColor] = useState<string>("bg-red-500")
  const { t } = useTranslation()

  const distanceToPoi = useMemo(() => {
    const distancePoi = calculateDistance(
      position.lat,
      position.lng,
      poi.latitude,
      poi.longitude
    )
    setDistanceToPoi(distancePoi)
    return distancePoi
  }, [poi, position, setDistanceToPoi])

  useEffect(() => {
    const totalMeters = distanceToPoi.kilometters * 1000 + distanceToPoi.metters
    const currentlyInside = totalMeters <= poi.radius

    if (currentlyInside !== isInsideRadius) {
      setIsInsideRadius(currentlyInside)
      if (onRadiusChange) {
        onRadiusChange(currentlyInside)
      }
    }

    // Cambiar el color de fondo según la distancia
    if (totalMeters <= poi.radius) {
      setBgColor("bg-green-500")
    } else if (totalMeters <= poi.radius + 50) {
      setBgColor("bg-yellow-500")
    } else {
      setBgColor("bg-red-500")
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
      className={`absolute z-50 mx-auto top-0 left-0 right-0 shadow-lg rounded-b-lg p-3 text-center text-white font-semibold ${bgColor}`}
      style={{
        zIndex: 500
      }}
    >
      <p>{messageDistance}</p>
    </div>
  )
}

export default DistanceIndicator
