import DashboardLayout from "@/components/DashboardLayout"
import { useTranslation } from "@/hooks/useTranslation"

export default function Leaderboard() {
  const { t } = useTranslation()

  const leaderboardData = [
    { name: "Usuario1", points: 1200, medal: "🥇" },
    { name: "Usuario2", points: 1100, medal: "🥈" },
    { name: "Usuario3", points: 950, medal: "🥉" },
    { name: "Usuario4", points: 870 },
    { name: "Usuario5", points: 820 }
  ]

  return (
    <DashboardLayout>
      <div className='p-6'>
        <div className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg'>
          <h1 className='text-3xl font-extrabold'>{t("Leaderboard")}</h1>
          <p className='mt-2 text-lg'>
            {t("Check the ranking and compete to reach the top!")}
          </p>
        </div>

        <div className='mt-6 bg-white shadow-lg rounded-lg p-6'>
          <ul className='divide-y divide-gray-300'>
            {leaderboardData.map((user, index) => (
              <li
                key={index}
                className='py-4 px-6 flex justify-between items-center text-lg hover:bg-gray-100 rounded-md transition duration-200'
              >
                <span className='font-medium'>
                  {user?.medal ? (
                    <span className='mr-2'>{user?.medal}</span>
                  ) : (
                    <span className='text-gray-500'>{index + 1}. </span>
                  )}
                  {user.name}
                </span>
                <span className='font-semibold text-indigo-600'>
                  {user.points} {t("points")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
