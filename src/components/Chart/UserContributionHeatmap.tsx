import { TimeRange } from "@nivo/calendar"
import { useTranslation } from "@/hooks/useTranslation"

interface UserContributionHeatmapProps {
  leaderboardData: any
  userId: string
}

const UserContributionHeatmap: React.FC<UserContributionHeatmapProps> = ({
  leaderboardData,
  userId
}) => {
  const { t } = useTranslation()
  const today = new Date()
  const last30Days = new Date()
  last30Days.setDate(today.getDate() - 30)

  const activityMap: { [day: string]: number } = {}

  leaderboardData?.task?.forEach((task: any) => {
    task.points?.forEach((entry: any) => {
      if (entry.externalUserId === userId) {
        entry.pointsData?.forEach((data: any) => {
          const dateObj = new Date(data.created_at)
          const day = dateObj.toISOString().slice(0, 10)
          if (dateObj >= last30Days && dateObj <= today) {
            activityMap[day] = (activityMap[day] || 0) + 1 // Contar ocurrencias en vez de sumar puntos
          }
        })
      }
    })
  })

  const processedData = Object.entries(activityMap).map(([day, value]) => ({
    day,
    value,
    date: day // `TimeRange` necesita un campo `date`
  }))

  // Asegurar que los datos sean compatibles con Nivo TimeRange
  processedData.sort(
    (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
  )

  return (
    <div className='w-full h-full'>
      <h2 className='text-xl font-bold mb-4 text-gray-700 text-center'>
        {t("Your Contribution Heatmap (Last 30 Days)")}
      </h2>
      <p className='text-gray-500 text-center mb-2'>
        {t("Track your daily activity with this heatmap")}
      </p>
      {processedData.length > 0 ? (
        <TimeRange
          data={processedData}
          from={last30Days.toISOString().slice(0, 10)}
          to={today.toISOString().slice(0, 10)}
          emptyColor='#eeeeee'
          colors={["#e0f7fa", "#0288d1", "#01579b"]}
          daySpacing={4}
          dayBorderWidth={1}
          dayBorderColor='#000000'
          legends={[]}
          width={800}
          height={100}
        />
      ) : (
        <p className='text-center text-gray-500'>
          {t("No activity recorded in the last 30 days.")}
        </p>
      )}

      <p className='text-center text-gray-500 mt-2'>
        {t("The darker the color, the more activity on that day.")}
      </p>
    </div>
  )
}

export default UserContributionHeatmap
