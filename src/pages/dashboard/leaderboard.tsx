import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { useTranslation } from "@/hooks/useTranslation"
import { useDashboard } from "@/context/DashboardContext"
import { getApiGameBaseUrl } from "@/config/api"

const UserLeaderboardChart = dynamic(
  () => import("@/components/Chart/UserLeaderboardChart"),
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
  const [userActivity, setUserActivity] = useState([])
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
          console.log(leaderboard)
          setLeaderboardCompleteData(leaderboard)

          setLeaderboardData(leaderboard.task.flatMap(task => task.points))

          // Extract user activity
          const userPoints = leaderboard.task
            .flatMap(task => task.points)
            .filter(entry => entry.externalUserId === decodedToken?.sub)
          setUserActivity(
            userPoints.map(p => ({
              x: new Date(p.pointsData[0].created_at),
              y: p.points
            }))
          )
        } catch (error) {
          console.error("Error fetching leaderboard:", error)
        }
      }
      fetchLeaderboard()
    }
  }, [accessToken, selectedCampaign])

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
            {Array.isArray(leaderboardData) &&
              leaderboardData.map((entry, index) => {
                const isUser = entry.externalUserId === decodedToken?.sub
                return (
                  <li
                    key={index}
                    className={`py-4 px-6 flex justify-between items-center text-lg rounded-md transition duration-200 ${
                      isUser ? "bg-blue-100 font-bold" : "hover:bg-gray-100"
                    }`}
                  >
                    <span className='font-medium'>
                      {isUser ? (
                        <span className='text-blue-700'>
                          {t("You")} (#{index + 1})
                        </span>
                      ) : (
                        <span className='text-gray-500'>
                          #{index + 1}. ****
                        </span>
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
        {leaderboardCompleteData && (
          <div className='mt-6 bg-white shadow-lg rounded-lg p-2'>
            <UserLeaderboardChart
              leaderboardData={leaderboardCompleteData}
              userId={decodedToken?.sub}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
