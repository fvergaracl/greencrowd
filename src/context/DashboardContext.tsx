import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from "react"
import { getPersistedState, persistState } from "../utils/persistentState"
import axios from "axios"
import { getApiBaseUrl } from "@/config/api"
import { logEvent } from "@/utils/logger"
import Swal from "sweetalert2"
import { getDeviceHeading } from "@/utils/getDeviceHeading"
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

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [position, setPosition] = useState<IPosition | null>(null)
  const [positionFullDetails, setPositionFullDetails] =
    useState<IPositionFullDetails | null>(null)
  const [mapCenter, setMapCenter] = useState<IPosition | null>(null)
  const [isTracking, setIsTracking] = useState<boolean>(true)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const toggleTracking = () => setIsTracking(prev => !prev)

  const updatePosition = async (time = 1) => {
    if (time >= 3) return
    if (!isTracking) return

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
          accuracy: location.coords.accuracy,
          altitude: location.coords.altitude,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          heading: finalHeading,
          speed: location.coords.speed
        }

        if (location?.coords?.accuracy > 20) {
          setPositionFullDetails(newPosition)
          setPosition(newPosition)

          try {
            await axios.post(`${getApiBaseUrl()}/userTrajectory`, newPosition)
          } catch (error) {
            console.error("Error sending user trajectory:", error)
          }

          if (!mapCenter) setMapCenter(newPosition)
        } else {
          updatePosition(time + 1)
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

    updatePosition()

    return () => clearInterval(interval)
  }, [isTracking])

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
        positionFullDetails
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
