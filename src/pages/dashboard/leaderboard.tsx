import dynamic from "next/dynamic"
import { useEffect, useState, useMemo } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { useTranslation } from "@/hooks/useTranslation"
import { useDashboard } from "@/context/DashboardContext"
import { getApiGameBaseUrl } from "@/config/api"
import Lottie from "lottie-react"
import LoadingGraph from "@/lotties/loading_graph.json"

const UserLeaderboardChart = dynamic(
  () => import("@/components/Chart/UserLeaderboardChart"),
  { ssr: false }
)

const UserContributionHeatmap = dynamic(
  () => import("@/components/Chart/UserContributionHeatmap"),
  { ssr: false }
)

const decodeToken = token => {
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

export default function Leaderboard() {
  const [accessToken, setAccessToken] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState([])
  const [leaderboardCompleteData, setLeaderboardCompleteData] = useState(null)
  const { selectedCampaign } = useDashboard()
  const { t } = useTranslation()

  let decodedToken = null
  if (accessToken) {
    decodedToken = decodeToken(accessToken)
  }

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/auth/token", {
          method: "GET",
          credentials: "include"
        })
        if (!response.ok) throw new Error("Failed to fetch token")
        const { access_token } = await response.json()
        setAccessToken(access_token)
      } catch (error) {
        console.error("Error fetching token:", error)
      }
    }
    fetchToken()
  }, [])

  useEffect(() => {
    if (accessToken && selectedCampaign?.gameId) {
      const fetchLeaderboard = async () => {
        try {
          const response = await fetch(
            `${getApiGameBaseUrl()}/games/${selectedCampaign?.gameId}/points/details`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          if (!response.ok) throw new Error("Failed to fetch leaderboard")
          const leaderboard = await response.json()
          setLeaderboardCompleteData(leaderboard)

          const allPoints = leaderboard.task.flatMap(task => task.points)
          const userPointsMap = {}

          for (const entry of allPoints) {
            if (!entry?.externalUserId) continue
            if (!userPointsMap[entry.externalUserId]) {
              userPointsMap[entry.externalUserId] = {
                externalUserId: entry.externalUserId,
                points: 0
              }
            }
            userPointsMap[entry.externalUserId].points += entry.points || 0
          }

          const aggregatedPoints = Object.values(userPointsMap)
          setLeaderboardData(aggregatedPoints)
        } catch (error) {
          console.error("Error fetching leaderboard:", error)
        }
      }
      fetchLeaderboard()
    }
  }, [accessToken, selectedCampaign])

  const filteredLeaderboard = useMemo(() => {
    if (!leaderboardData.length) return []

    leaderboardData.sort((a, b) => b.points - a.points)

    const userIndex = leaderboardData.findIndex(
      entry => entry.externalUserId === decodedToken?.sub
    )

    const topThree = leaderboardData.slice(0, 3)
    const userAndNextThree =
      userIndex !== -1 ? leaderboardData.slice(userIndex, userIndex + 4) : []

    return [...topThree, ...userAndNextThree].filter(
      (entry, index, self) =>
        self.findIndex(e => e.externalUserId === entry.externalUserId) === index
    )
  }, [leaderboardData, decodedToken])

  const MemoizedCharts = useMemo(() => {
    return (
      <>
        <div className='mt-6 bg-white shadow-lg rounded-lg p-2'>
          <UserLeaderboardChart
            leaderboardData={leaderboardCompleteData}
            userId={decodedToken?.sub}
          />
        </div>
        <div className='mt-6 bg-white shadow-lg rounded-lg p-2'>
          <UserContributionHeatmap
            leaderboardData={leaderboardCompleteData}
            userId={decodedToken?.sub}
          />
        </div>
      </>
    )
  }, [leaderboardCompleteData])

  return (
    <DashboardLayout>
      <div className='p-6'>
        <div className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-2 rounded-lg shadow-lg text-center'>
          <h1 className='text-3xl font-extrabold'>{t("Leaderboard")}</h1>
          <p className='mt-2 text-lg'>
            {t("Check the ranking and compete to reach the top!")}
          </p>
        </div>
        <div className='mt-6 bg-white shadow-lg rounded-lg p-2'>
          <ul className='divide-y divide-gray-300'>
            {filteredLeaderboard.map(entry => {
              const isUser = entry.externalUserId === decodedToken?.sub
              const rank =
                leaderboardData.findIndex(
                  e => e.externalUserId === entry.externalUserId
                ) + 1
              return (
                <li
                  key={entry.externalUserId}
                  className={`py-4 px-6 flex justify-between items-center text-lg rounded-md transition duration-200 ${
                    isUser ? "bg-blue-100 font-bold" : "hover:bg-gray-100"
                  }`}
                >
                  <span className='font-medium'>
                    {isUser ? (
                      <span className='text-blue-700'>
                        {t("You")} (#{rank})
                      </span>
                    ) : (
                      <span className='text-gray-500'>#{rank}. ****</span>
                    )}
                  </span>
                  <span
                    className={`font-semibold ${isUser ? "text-blue-700" : "text-gray-500"}`}
                  >
                    {entry.points} {t("points")}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
        {!leaderboardCompleteData && (
          <div className='mt-6 bg-white shadow-lg rounded-lg p-2'>
            <Lottie animationData={LoadingGraph} loop className='w-2/3' />
          </div>
        )}

        {leaderboardCompleteData && MemoizedCharts}
      </div>
    </DashboardLayout>
  )
}
