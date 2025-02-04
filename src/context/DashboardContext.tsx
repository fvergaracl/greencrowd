import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from "react"
import { getPersistedState, persistState } from "../utils/persistentState"
import axios from "axios"

export interface IPosition {
  lat: number
  lng: number
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
  const [mapCenter, setMapCenter] = useState<IPosition | null>(null)
  const [isTracking, setIsTracking] = useState<boolean>(true)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const toggleTracking = () => setIsTracking(prev => !prev)

  const updatePosition = async () => {
    if (!isTracking) return

    navigator.geolocation.getCurrentPosition(
      location => {
        const newPosition = {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }
        setPosition(newPosition)
        // console.log("New position:", newPosition)
        axios.post("/api/userTrajectory", newPosition)

        if (!mapCenter) setMapCenter(newPosition)
      },
      error => {
        console.error("Error fetching location:", error)
      }
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
        logout
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
