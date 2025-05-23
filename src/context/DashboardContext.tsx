import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef
} from "react"
import { getPersistedState, persistState } from "../utils/persistentState"
import axios from "axios"
import { getApiBaseUrl } from "@/config/api"
import { logEvent } from "@/utils/logger"
import { evaluatePositionInPolygons } from "@/utils/evaluatePositionInPolygons"
import { getDeviceHeading } from "@/utils/getDeviceHeading"

export interface IDistanceToPoi {
  kilometters: number
  metters: number
}

export interface IPosition {
  lat: number
  lng: number
}

export interface IPositionFullDetails {
  accuracy: number
  lat: number
  lng: number
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
}

interface User {
  name: string
  email: string
}

export interface DashboardContextType {
  user: User | null
  setUser: (user: User | null) => void
  position: IPosition | null
  updatePosition: () => void
  isTracking: boolean
  toggleTracking: () => void
  mapCenter: IPosition | null
  setMapCenter: (center: IPosition) => void
  selectedCampaign: any | null
  setSelectedCampaign: (campaign: any | null) => void
  loading: boolean
  logout: () => void
  positionFullDetails: IPositionFullDetails | null
  distanceToPoi: IDistanceToPoi
  setDistanceToPoi: (distance: IDistanceToPoi) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
)

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}

type InputData = {
  newPosition: { lat: number; lng: number }
  areas: {
    polygon: [number, number][]
  }[]
}

export function extractPositionAndPolygons(data: InputData) {
  const { lat, lng } = data.newPosition

  const polygons: [number, number][][] = data.areas.map(area => {
    return area.polygon
  })

  return {
    position: { lat, lng },
    polygons
  }
}

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [position, setPosition] = useState<IPosition | null>(null)
  const [positionFullDetails, setPositionFullDetails] =
    useState<IPositionFullDetails | null>(null)
  const [mapCenter, setMapCenter] = useState<IPosition | null>(null)
  const [isTracking, setIsTracking] = useState<boolean>(true)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [distanceToPoi, setDistanceToPoi] = useState<IDistanceToPoi>({
    kilometters: 0,
    metters: 0
  })
  const isUpdatingRef = useRef(false)

  const toggleTracking = () => setIsTracking(prev => !prev)

  const updatePosition = async (time = 1, acceptableAccuracy = 30) => {
    if (isUpdatingRef.current || time > 10 || !isTracking) return
    isUpdatingRef.current = true
    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }

    navigator.geolocation.getCurrentPosition(
      async location => {
        let finalHeading = location.coords.heading ?? (await getDeviceHeading())
        const newPosition = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy ?? 99,
          altitude: location.coords.altitude,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          heading: finalHeading,
          speed: location.coords.speed
        }

        if (
          typeof location?.coords?.accuracy === "number" &&
          (location?.coords?.accuracy <= acceptableAccuracy || time >= 10)
        ) {
          setPositionFullDetails(newPosition)
          setPosition(newPosition)
          if (newPosition) {
            const cleanedData = extractPositionAndPolygons({
              newPosition,
              areas: selectedCampaign?.areas || []
            })

            const farFromArea = evaluatePositionInPolygons(
              cleanedData.position,
              cleanedData.polygons
            )
            let conditionToSendPositon = farFromArea?.isInsideAnyPolygon
            if (!conditionToSendPositon) {
              conditionToSendPositon =
                farFromArea?.distanceToClosestPolygon !== null &&
                farFromArea?.distanceToClosestPolygon <= 100
            }
            if (conditionToSendPositon) {
              try {
                axios.post(`${getApiBaseUrl()}/userTrajectory`, newPosition)
              } catch (error) {
                console.error("Error sending user trajectory:", error)
              }
            }
            isUpdatingRef.current = false
            if (!mapCenter) setMapCenter(newPosition)
          }
        } else {
          if (time >= 9) {
            logEvent(
              "GEOLOCATION_ACCURACY_TOO_HIGH",
              "Geolocation accuracy is too high, retrying...",
              { accuracy: location.coords.accuracy, acceptableAccuracy, time }
            )
          }
          isUpdatingRef.current = false
          updatePosition(time + 1, acceptableAccuracy + 10)

          return
        }
      },
      error => {
        let text = "An unknown error occurred."
        let errorEventName = "GEOLOCATION_UNKNOWN_ERROR_IN_UPDATE_POSITION"

        switch (error.code) {
          case error.PERMISSION_DENIED: {
            text =
              "You denied the request for Geolocation. Please allow access to use this feature."
            errorEventName = "GEOLOCATION_PERMISSION_DENIED_IN_UPDATE_POSITION"
            break
          }
          case error.POSITION_UNAVAILABLE: {
            text = "Location information is unavailable."
            errorEventName =
              "GEOLOCATION_POSITION_UNAVAILABLE_IN_UPDATE_POSITION"
            break
          }
          case error.TIMEOUT: {
            text = "The request to get user location timed out."
            errorEventName = "GEOLOCATION_TIMEOUT_IN_UPDATE_POSITION"
            break
          }
        }
        logEvent(errorEventName, text, { error })
      },
      geoOptions
    )
  }

  useEffect(() => {
    const initializeState = () => {
      const persistedUser = getPersistedState<User | null>(
        "dashboard_user",
        null
      )
      const persistedPosition = getPersistedState<IPosition | null>(
        "dashboard_position",
        null
      )
      const persistedMapCenter = getPersistedState<IPosition | null>(
        "dashboard_mapCenter",
        null
      )
      const persistedIsTracking = getPersistedState<boolean>(
        "dashboard_isTracking",
        true
      )
      const persistedCampaign = getPersistedState<string | null>(
        "dashboard_selectedCampaign",
        null
      )

      setUser(persistedUser)
      setPosition(persistedPosition)
      setMapCenter(persistedMapCenter)
      setIsTracking(persistedIsTracking)
      setSelectedCampaign(persistedCampaign)
      setLoading(false)
    }

    if (typeof window !== "undefined") {
      initializeState()
    }
  }, [])

  useEffect(() => {
    if (!loading) persistState("dashboard_user", user)
  }, [user, loading])

  useEffect(() => {
    if (!loading) persistState("dashboard_position", position)
  }, [position, loading])

  useEffect(() => {
    if (!loading) persistState("dashboard_mapCenter", mapCenter)
  }, [mapCenter, loading])

  useEffect(() => {
    if (!loading) persistState("dashboard_isTracking", isTracking)
  }, [isTracking, loading])

  useEffect(() => {
    if (!loading) persistState("dashboard_selectedCampaign", selectedCampaign)
  }, [selectedCampaign, loading])

  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(() => {
      updatePosition()
    }, 5000)
    if (selectedCampaign) {
      updatePosition()
    }

    return () => clearInterval(interval)
  }, [isTracking, selectedCampaign])

  const logout = () => {
    document.cookie = "access_token=; Max-Age=0; path=/"

    localStorage.clear()
    setUser(null)
    window.location.href = "/api/auth/logout"
  }

  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    )
  }

  return (
    <DashboardContext.Provider
      value={{
        user,
        setUser,
        position,
        updatePosition,
        isTracking,
        toggleTracking,
        mapCenter,
        setMapCenter,
        selectedCampaign,
        setSelectedCampaign,
        loading,
        logout,
        positionFullDetails,
        distanceToPoi,
        setDistanceToPoi
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
