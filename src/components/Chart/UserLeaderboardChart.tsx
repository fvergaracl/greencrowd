import { Line } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"
import "chartjs-adapter-date-fns"
import { useTranslation } from "@/hooks/useTranslation"
import zoomPlugin from "chartjs-plugin-zoom"

Chart.register(...registerables, zoomPlugin)

interface UserLeaderboardChartProps {
  leaderboardData: any
  userId: string
}

const UserLeaderboardChart: React.FC<UserLeaderboardChartProps> = ({
  leaderboardData,
  userId,
}) => {
  const { t } = useTranslation()
  const userActivity: { x: Date; y: number }[] = []
  const otherUsersActivity: { [hour: string]: number[] } = {}

  leaderboardData.task.forEach((task: any) => {
    task.points.forEach((entry: any) => {
      entry.pointsData.forEach((data: any) => {
        const hour = new Date(data.created_at).toISOString().slice(0, 13)

        if (entry.externalUserId === userId) {
          userActivity.push({ x: new Date(data.created_at), y: data.points })
        } else {
          if (!otherUsersActivity[hour]) {
            otherUsersActivity[hour] = []
          }
          otherUsersActivity[hour].push(data.points)
        }
      })
    })
  })

  const averageOtherUsersActivity = Object.keys(otherUsersActivity).map(
    hour => {
      return {
        x: new Date(hour + ":00:00"),
        y:
          otherUsersActivity[hour].reduce((a, b) => a + b, 0) /
          otherUsersActivity[hour].length
      }
    }
  )

  const chartData = {
    datasets: [
      {
        label: t("Your Activity (Points Earned)"),
        data: userActivity,
        borderColor: "#1D4ED8",
        backgroundColor: "rgba(29, 78, 216, 0.3)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7
      },
      {
        label: t("Average Points of Other Users"),
        data: averageOtherUsersActivity,
        borderColor: "#6B7280",
        backgroundColor: "rgba(107, 114, 128, 0.3)",
        fill: true,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      tooltip: {
        mode: "index" as const,
        intersect: false
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x"
        },
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          },
          mode: "x"
        }
      }
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "hour",
          displayFormats: {
            hour: "MMM dd HH:mm"
          }
        },
        ticks: {
          color: "#374151",
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t("Points Earned")
        },
        ticks: {
          color: "#374151"
        }
      }
    }
  }

  return (
    <>
      <h2 className='text-xl font-bold mb-4 text-gray-700 text-center'>
        {t("User Activity Over Time")}
      </h2>
      <p className='text-gray-500 text-center mb-2'>
        {t("Zoom in/out or pan to explore the data")}
      </p>
      <Line data={chartData} options={options} />
    </>
  )
}

export default UserLeaderboardChart
