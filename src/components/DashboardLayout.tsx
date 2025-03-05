import { useRouter } from "next/router"
import { ReactNode, useEffect, useState } from "react"
import {
  MdHome,
  MdSettings,
  MdEmojiEvents,
  MdAdminPanelSettings,
  MdLocationOn,
  MdCampaign
} from "react-icons/md"
import clsx from "clsx"
import { useTranslation } from "@/hooks/useTranslation"
import { useDashboard } from "../context/DashboardContext"
import { logEvent } from "@/utils/logger"
import Lottie from "lottie-react"
import onboarding_right_arrow_up from "@/lotties/onboarding_right_arrow_up.json"
interface DashboardLayoutProps {
  children: ReactNode
}

interface NavItem {
  label: string
  icon: JSX.Element
  path?: string
  onClick?: () => void
  isVisible?: boolean
  dataCy: string
  eventName?: string
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { isTracking, toggleTracking, selectedCampaign } = useDashboard()
  const [isAdministrator, setIsAdministrator] = useState<boolean>(false)

  const handleNavigation = (path: string, eventName: string) => {
    logEvent(eventName, `User clicked on ${path} button in navigation`, {
      path
    })

    router.push(path)
  }

  const decodeToken = (token: string): { roles?: string[] } | null => {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      )
      return payload
    } catch {
      console.error("Invalid token format")
      return null
    }
  }

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/auth/token", {
          method: "GET",
          credentials: "include"
        })
        if (!response.ok) {
          throw new Error("Failed to fetch token")
        }
        const { access_token } = await response.json()
        const decodedToken = decodeToken(access_token)
        if (decodedToken?.roles?.includes("admin")) {
          setIsAdministrator(true)
        }
      } catch (error) {
        console.error("Error fetching token:", error)
      }
    }

    fetchToken()
  }, [])

  const navItems: NavItem[] = [
    {
      label: t("Home"),
      icon: <MdHome className='h-6 w-6' />,
      path: "/dashboard",
      dataCy: "home-button",
      eventName: "CLICK_ON_HOME_BUTTON_IN_NAVIGATION"
    },
    {
      label: t("Campaigns"),
      icon: <MdCampaign className='h-6 w-6' />,
      path: "/dashboard/campaigns",
      dataCy: "campaigns-button",
      eventName: "CLICK_ON_CAMPAIGNS_BUTTON_IN_NAVIGATION"
    },
    ...(selectedCampaign?.gameId
      ? [
          {
            label: t("Leaderboard"),
            icon: <MdEmojiEvents className='h-6 w-6' />,
            path: "/dashboard/leaderboard",
            dataCy: "leaderboard-button",
            eventName: "CLICK_ON_LEADERBOARD_BUTTON_IN_NAVIGATION"
          }
        ]
      : []),
    {
      label: isTracking ? t("Stop") : t("Start"),
      icon: (
        <>
          <div className='relative'>
            {!isTracking && (
              <Lottie
                animationData={onboarding_right_arrow_up}
                className='absolute z-50 rotate-180'
                style={{
                  width: "60px",
                  height: "60px",
                  bottom: "30px",
                  right: "20px"
                }}
              />
            )}

            <MdLocationOn
              className={clsx("h-6 w-6 relative", {
                "text-green-500": isTracking,
                "text-red-500": !isTracking
              })}
            />
          </div>
        </>
      ),
      onClick: () => {
        toggleTracking()
        logEvent(
          isTracking
            ? "CLICK_ON_STOP_LOCATION_BUTTON_IN_NAVIGATION"
            : "CLICK_ON_ACTIVATE_LOCATION_BUTTON_IN_NAVIGATION",
          `User clicked on ${
            isTracking ? "stop location" : "activate location"
          } button in navigation`
        )
      },
      dataCy: "location-button",
      eventName: isTracking
        ? "CLICK_ON_STOP_LOCATION_BUTTON_IN_NAVIGATION"
        : "CLICK_ON_ACTIVATE_LOCATION_BUTTON_IN_NAVIGATION"
    },
    {
      label: t("Settings"),
      icon: <MdSettings className='h-6 w-6' />,
      path: "/dashboard/settings",
      dataCy: "settings-button",
      eventName: "CLICK_ON_SETTINGS_BUTTON_IN_NAVIGATION"
    },
    {
      label: t("Admin"),
      icon: <MdAdminPanelSettings className='h-6 w-6' />,
      path: "/admin",
      isVisible: isAdministrator,
      dataCy: "admin-button",
      eventName: "CLICK_ON_ADMIN_BUTTON_IN_NAVIGATION"
    }
  ]

  const renderNavButton = ({
    label,
    icon,
    path,
    onClick,
    isVisible = true,
    dataCy,
    eventName
  }: NavItem) => {
    if (!isVisible) return null

    return (
      <button
        key={label}
        className='flex flex-col items-center'
        onClick={onClick || (() => path && handleNavigation(path, eventName))}
        data-cy={dataCy}
      >
        {icon}
        <span className='text-xs'>{label}</span>
      </button>
    )
  }

  return (
    <div className='h-screen flex flex-col bg-gray-100'>
      <div className='flex-grow overflow-auto'>{children}</div>
      <nav className='h-16 bg-gray-800 flex items-center justify-around text-white'>
        {navItems.map(renderNavButton)}
      </nav>
    </div>
  )
}
