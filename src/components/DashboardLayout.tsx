import { useRouter } from "next/router"
import { ReactNode, useState, useEffect } from "react"
import {
  MdHome,
  MdSettings,
  MdEmojiEvents,
  MdLocationOn,
  MdCampaign
} from "react-icons/md"
import { RxActivityLog } from "react-icons/rx"
import clsx from "clsx"
import { useTranslation } from "@/hooks/useTranslation"
import { useDashboard } from "../context/DashboardContext"
import { logEvent } from "@/utils/logger"
import Lottie from "lottie-react"
import onboarding_right_arrow_up from "@/lotties/onboarding_right_arrow_up.json"
interface DashboardLayoutProps {
  children: ReactNode | ReactNode[]
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
  const [hasRedirected, setHasRedirected] = useState(false)
  const { isTracking, toggleTracking, selectedCampaign } = useDashboard()

  useEffect(() => {
    const checkPendingQuestionnaires = async () => {
      if (!selectedCampaign?.id || hasRedirected) return

      const allowedPaths = ["/dashboard/campaigns", "/dashboard/settings"]

      const isAllowed =
        router.pathname.startsWith("/dashboard/questionnaires") ||
        allowedPaths.includes(router.pathname) ||
        router.pathname.startsWith("/admin")

      if (isAllowed) return

      try {
        const res = await fetch(
          `/api/questionnaires/pending?campaignId=${selectedCampaign.id}`
        )
        const data = await res.json()
        if (res.ok && data.count > 0) {
          setHasRedirected(true)
          await router.push("/dashboard/questionnaires")
        }
      } catch (error) {
        console.error("Error checking pending questionnaires", error)
      }
    }

    checkPendingQuestionnaires()
  }, [selectedCampaign?.id, hasRedirected, router.pathname])

  const handleNavigation = (path: string, eventName: string) => {
    logEvent(eventName, `User clicked on ${path} button in navigation`, {
      path
    })

    router.push(path)
  }

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
                  width: "50px",
                  height: "50px",
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
      label: t("My Activity"),
      icon: <RxActivityLog className='h-6 w-6' />,
      path: "/dashboard/task/MyTaskActivity",
      dataCy: "my-activity-button",
      eventName: "CLICK_ON_MY_ACTIVITY_BUTTON_IN_NAVIGATION"
    },
    {
      label: t("Settings"),
      icon: <MdSettings className='h-6 w-6' />,
      path: "/dashboard/settings",
      dataCy: "settings-button",
      eventName: "CLICK_ON_SETTINGS_BUTTON_IN_NAVIGATION"
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
        <span className='text-[10px]'>{label}</span>
      </button>
    )
  }

  return (
    <div className='h-screen flex flex-col bg-gray-100'>
      <div className='flex-grow overflow-auto'>{children}</div>
      <nav
        className='h-14 bg-gray-800 flex items-center justify-around text-white'
        style={{
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        {navItems.map(renderNavButton)}
      </nav>
    </div>
  )
}
