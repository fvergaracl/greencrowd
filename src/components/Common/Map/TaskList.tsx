import { motion } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { getApiBaseUrl } from "@/config/api"

import { useDashboard } from "@/context/DashboardContext"

const TaskList = ({
  isTracking,
  selectedPoi,
  myActivityInCampaign,
  errorPoi,
  logEvent,
  t
}) => {


  const { distanceToPoi } = useDashboard()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [allowEntryPoi, setAllowEntryPoi] = useState(false)
  const tasksRef = useRef(null)

  const tasks = selectedPoi.tasks || []
  const totalTasks = tasks.length

  useEffect(() => {
    const conditon =
      distanceToPoi.kilometters <= 0 &&
      distanceToPoi.metters >= 0 &&
      distanceToPoi.metters < selectedPoi.radius + 100
        ? true
        : false
    if (conditon) {
      setAllowEntryPoi(true)
    } else {
      setAllowEntryPoi(false)
    }
  }, [distanceToPoi])

  if (!isTracking || !selectedPoi) return null

  const scrollTasks = (direction: string) => {
    if (!tasksRef.current) return

    if (direction === "up" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (direction === "down" && currentIndex < totalTasks - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const timeAgo = timestamp => {
    const diffMs = Date.now() - timestamp
    const minutes = Math.floor(diffMs / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    return "a few seconds ago"
  }

  const getTaskActivitySummary = myActivityInCampaign => {
    const summary = {}

    myActivityInCampaign.forEach(({ createdAt, task }) => {
      const key = `${task.id}|${task.pointOfInterestId}`
      const timestamp = new Date(createdAt).getTime()

      if (!summary[key]) {
        summary[key] = {
          count: 1,
          lastResponse: timestamp
        }
      } else {
        summary[key].count += 1
        summary[key].lastResponse = Math.max(
          summary[key].lastResponse,
          timestamp
        )
      }
    })

    return summary
  }

  const TaskInfoRow = ({ icon, label, value }) => (
    <div className='flex items-center justify-between gap-1'>
      <span className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
        <span className='text-lg'>{icon}</span>
        <span className='font-medium text-sm'>{label}</span>
      </span>
      <span className='text-sm text-right'>{value}</span>
    </div>
  )

  const formatDate = dateString =>
    new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(dateString))

  const taskActivitySummary = getTaskActivitySummary(myActivityInCampaign)

  return (
    <div className='relative h-[40vh] bg-white dark:bg-gray-900 shadow-lg rounded-lg  overflow-hidden'>
      <h4 className='text-lg text-center font-bold text-gray-900 dark:text-slate-100 mb-2'>
        {selectedPoi.name}
      </h4>
      {totalTasks <= 0 && (
        <p className='text-gray-600 dark:text-gray-400 text-center p-4'>
          {t("No tasks available")}
        </p>
      )}
      {totalTasks > 0 && (
        <div className='relative flex flex-col items-center'>
          {currentIndex > 0 && (
            <button
              className='absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow focus:outline-none z-10'
              onClick={() => scrollTasks("up")}
            >
              ↑
            </button>
          )}

          <div className='relative w-full flex flex-col items-center overflow-y-hidden px-1'>
            <motion.div
              ref={tasksRef}
              className='w-full flex flex-col items-center px-3 pb-4 transition-transform'
              animate={{ translateY: -currentIndex * 140 }}
            >
              {!allowEntryPoi && errorPoi && (
                <p className='text-red-500 dark:text-red-400 text-center p-4 text-sm font-medium'>
                  {errorPoi}
                </p>
              )}

              {tasks.map(task => {
                const key = `${task.id}|${task.pointOfInterestId}`
                const activity = taskActivitySummary[key]

                return (
                  <motion.div
                    key={task.id}
                    className={`w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 mb-4 transition-all ${
                      !allowEntryPoi && errorPoi
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:ring-1 hover:ring-blue-400"
                    }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className='flex flex-col'>
                      <h5 className='text-base font-semibold text-gray-900 dark:text-white leading-tight'>
                        {task.title}
                      </h5>
                      <p className='text-sm text-gray-500 dark:text-gray-300 mt-1 overflow-hidden text-ellipsis whitespace-nowrap'>
                        {task.description || t("No description available")}
                      </p>

                      <div className='text-sm text-gray-700 dark:text-gray-200 mt-4 space-y-3'>
                        {task.availableFrom && (
                          <TaskInfoRow
                            icon='📅'
                            label={t("Available from")}
                            value={formatDate(task.availableFrom)}
                          />
                        )}

                        {task.availableTo && (
                          <TaskInfoRow
                            icon='⏳'
                            label={t("Available until")}
                            value={formatDate(task.availableTo)}
                          />
                        )}

                        <TaskInfoRow
                          icon='📝'
                          label={t("Response limit")}
                          value={task?.responseLimit ?? t("No limit")}
                        />

                        <TaskInfoRow
                          icon='⏱️'
                          label={t("Response interval (min)")}
                          value={
                            task?.responseLimitInterval ?? t("Not defined")
                          }
                        />

                        {activity && (
                          <>
                            <TaskInfoRow
                              icon='✅'
                              label={t("Responses")}
                              value={
                                <span className='bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full text-xs font-semibold'>
                                  {activity.count}
                                </span>
                              }
                            />

                            <TaskInfoRow
                              icon='⏰'
                              label={t("Last response")}
                              value={
                                <span className='italic text-xs text-gray-500 dark:text-gray-400'>
                                  {timeAgo(activity.lastResponse)}
                                </span>
                              }
                            />
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (!allowEntryPoi && errorPoi) {
                            logEvent(
                              "USER_CLICKED_ENTER_TASK_ERROR",
                              "User clicked on the enter task button but there was an error",
                              { poi: selectedPoi, task }
                            )
                          } else {
                            logEvent(
                              "USER_CLICKED_ENTER_TASK",
                              "User clicked on the enter task button",
                              { poi: selectedPoi, task }
                            )
                            window.location.href = `/dashboard/task/${task.id}`
                          }
                        }}
                        className={`w-full mt-4 px-4 py-2 text-center text-sm font-semibold rounded-lg transition ${
                          !allowEntryPoi && errorPoi
                            ? "bg-gray-500 text-white cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white focus:ring focus:ring-blue-300"
                        }`}
                      >
                        {t("Enter Task")}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          {currentIndex < totalTasks - 1 && (
            <button
              className='absolute bottom-0 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow focus:outline-none z-10'
              onClick={() => scrollTasks("down")}
            >
              ↓
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskList
